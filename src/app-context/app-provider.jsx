import { useDataQuery } from '@dhis2/app-runtime'
import { Layer } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { Loader } from '../shared/index.js'
import { normalizeMetadata } from '../utils/app-provider-util.js'
import { AppContext } from './app-context.js'

const userAndWorkflowQuery = {
    me: {
        resource: 'me',
        params: {
            fields: ['authorities', 'organisationUnits[id,path]'],
        },
    },
    dataApprovalWorkflows: {
        // This is generic enpoint but will only return
        // workflows a user is allowed to see
        resource: 'dataApprovalWorkflows',
        params: {
            paging: false,
            fields: [
                'id',
                'displayName',
                'dataApprovalLevels',
                'periodType',
                'dataSets[id,displayName,periodType,formType,categoryCombo[id],organisationUnits[id,path]]',
            ],
        },
    },
}

const metadataQuery = {
    categoryCombos: {
        resource: 'categoryCombos',
        params: ({ categoryComboIds }) => ({
            filter: [`id:in:[${categoryComboIds.join(',')}]`],
            paging: false,
            fields: ['id', 'displayName', 'isDefault', 'categories[id]'],
        }),
    },
    categories: {
        resource: 'categories',
        params: ({ categoryComboIds }) => ({
            filter: [`categoryCombos.id:in:[${categoryComboIds.join(',')}]`],
            paging: false,
            fields: [
                'id',
                'displayName',
                'categoryOptions[id,displayName,organisationUnits[id,path],startDate,endDate]',
            ],
        }),
    },
    categoryOptionCombos: {
        resource: 'categoryOptionCombos',
        params: ({ categoryComboIds }) => ({
            filter: [`categoryCombo.id:in:[${categoryComboIds.join(',')}]`],
            paging: false,
            fields: [
                'id',
                'displayName',
                'categoryCombo[id]',
                'categoryOptions[id]',
            ],
        }),
    },
}

const AppProvider = ({ children }) => {
    const {
        data: workflowData,
        fetching: fetchingWorkflows,
        error: workflowError,
    } = useDataQuery(userAndWorkflowQuery)

    const dataApprovalWorkflows =
        workflowData?.dataApprovalWorkflows?.dataApprovalWorkflows ?? []

    const categoryComboIdSets = dataApprovalWorkflows.reduce(
        (ids, workflow) => {
            for (const dataSet of workflow.dataSets) {
                if (dataSet.categoryCombo?.id) {
                    ids.add(dataSet.categoryCombo.id)
                }
            }
            return ids
        },
        new Set()
    )

    const categoryComboIds = [...categoryComboIdSets]
    // Only fetch metadata if there are category combo IDs to avoid unnecessary queries
    const shouldFetchMetadata = workflowData && categoryComboIds.length > 0

    const {
        data: metadata,
        refetch: refetchMetadata,
        called: calledMetadata,
        fetching: fetchingMetadata,
        error: metadataError,
    } = useDataQuery(metadataQuery, {
        variables: { categoryComboIds: categoryComboIdSets },
        lazy: true,
    })

    useEffect(() => {
        if (workflowData && shouldFetchMetadata) {
            refetchMetadata({ categoryComboIds })
        }
    }, [workflowData])

    if (
        fetchingWorkflows ||
        (shouldFetchMetadata && (!calledMetadata || fetchingMetadata))
    ) {
        return (
            <Layer>
                <Loader />
            </Layer>
        )
    }

    if (workflowError || metadataError) {
        /**
         * The app can't continue if this fails, because it doesn't
         * have any data, so throw the error and let it be caught by
         * the error boundary in the app-shell
         */
        throw workflowError || metadataError
    }

    const { authorities, organisationUnits } = workflowData.me
    const categoryCombos = metadata?.categoryCombos?.categoryCombos ?? []
    const categories = metadata?.categories?.categories ?? []
    const categoryOptionCombos =
        metadata?.categoryOptionCombos?.categoryOptionCombos ?? []

    const providerValue = {
        authorities,
        organisationUnits,
        dataApprovalWorkflows,
        metadata: normalizeMetadata(
            categoryCombos,
            categories,
            categoryOptionCombos
        ),
    }

    return (
        <AppContext.Provider value={providerValue}>
            {children}
        </AppContext.Provider>
    )
}

AppProvider.propTypes = {
    children: PropTypes.node.isRequired,
}

export { AppProvider }
