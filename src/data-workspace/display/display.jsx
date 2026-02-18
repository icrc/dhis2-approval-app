import { useConfig, useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { NoticeBox, CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useAppContext } from '../../app-context/index.js'
import { useSelectionContext } from '../../selection-context/index.js'
import {
    getFixedPeriodsForTypeAndDateRange,
    RetryButton,
} from '../../shared/index.js'
import {
    filterDataSetsByAttributeOptionComboAndOrgUnit,
    getDataSetReportFilter,
} from '../../utils/category-combo-utils.js'
import styles from './display.module.css'
import { TableCustomDataSet } from './table-custom-data-set.jsx'
import { Table } from './table.jsx'

const query = {
    dataSetReport: {
        resource: 'dataSetReport',
        params: ({ dataSetId, periodIds, orgUnit, filter }) => ({
            // arrays are being handled by the app runtime
            pe: periodIds,
            ds: dataSetId,
            ou: orgUnit.id,
            selectedUnitOnly: false,
            filter: filter,
        }),
    },
}

const Display = ({ dataSetId }) => {
    const { metadata } = useAppContext()
    const selection = useSelectionContext()
    const { orgUnit, workflow, period, attributeCombo, attributeOptionCombo } =
        selection
    const dataSets = filterDataSetsByAttributeOptionComboAndOrgUnit(metadata, {
        workflow,
        orgUnit,
        attributeOptionCombo,
    })
    const { systemInfo = {} } = useConfig()
    const { calendar = 'gregory' } = systemInfo

    const selectedDataSet = dataSets.find(({ id }) => id === dataSetId)
    const periodIds = selectedDataSet
        ? getFixedPeriodsForTypeAndDateRange(
              selectedDataSet.periodType,
              period.startDate,
              period.endDate
          ).map(({ id }) => id)
        : []
    const categoryFilter = attributeOptionCombo
        ? getDataSetReportFilter(metadata, {
              attributeCombo,
              attributeOptionCombo,
              period,
              calendar,
          })
        : ''

    const { called, fetching, data, error, refetch } = useDataQuery(query, {
        lazy: true,
    })
    const tables = data?.dataSetReport
    const fetchDataSet = () =>
        refetch({ periodIds, dataSetId, orgUnit, filter: categoryFilter })

    useEffect(
        () => {
            if (
                workflow &&
                periodIds.length &&
                dataSetId &&
                attributeOptionCombo &&
                orgUnit
            ) {
                fetchDataSet()
            }
        },
        // joining so this produces a primitive value
        [
            workflow,
            periodIds.join(','),
            dataSetId,
            attributeOptionCombo,
            orgUnit,
        ]
    )

    if (!dataSets || dataSets.length === 0) {
        return (
            <div className={styles.noData}>
                <p>
                    {i18n.t(
                        'Workflow "{{ workflowName }}", organisation unit "{{ orgunitName }}" and attribute option combo "{{ attrOptionComboName }}" does not contain any data sets.',
                        {
                            orgunitName: orgUnit?.displayName,
                            workflowName: workflow?.displayName,
                            attrOptionComboName:
                                attributeOptionCombo?.displayName,
                        }
                    )}
                </p>
            </div>
        )
    }

    if (!dataSetId && dataSets.length > 1) {
        return (
            <div className={styles.chooseDataSet}>
                <h2>{i18n.t('Choose a data set to review')}</h2>
                <p>
                    {i18n.t(
                        '{{- workflowName}} has multiple data sets. Choose a data set from the tabs above.',
                        { workflowName: workflow.displayName }
                    )}
                </p>
            </div>
        )
    }

    if ((!called && periodIds.length) || fetching) {
        return (
            <div className={styles.display}>
                <div className={styles.loadingWrapper}>
                    <CircularLoader small />
                    {i18n.t('Loading data set')}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.display}>
                <NoticeBox
                    error
                    title={i18n.t(
                        'There was a problem displaying this data set'
                    )}
                >
                    <p>
                        {i18n.t(
                            `This data set couldn't be loaded or displayed. Try again, or contact your system administrator.`
                        )}
                    </p>
                    <RetryButton onClick={fetchDataSet}>
                        {i18n.t('Retry loading data set')}
                    </RetryButton>
                </NoticeBox>
            </div>
        )
    }

    if (!periodIds.length || !tables.length) {
        return (
            <div className={styles.noData}>
                <p>
                    {i18n.t(
                        `This data set doesn't have any data for {{- period}} in {{- orgUnit}}.`,
                        {
                            period: period.displayName,
                            orgUnit: orgUnit.displayName,
                        }
                    )}
                </p>
            </div>
        )
    }

    if (selectedDataSet.formType === 'CUSTOM') {
        return (
            <div className={styles.display}>
                {tables.map((table) => (
                    <TableCustomDataSet
                        key={table.title}
                        title={table.title}
                        columns={table.headers.map((h) => h.name)}
                        rows={table.rows}
                    />
                ))}
            </div>
        )
    }
    return (
        <div className={styles.display}>
            {tables.map((table) => (
                <Table
                    key={table.title}
                    title={table.title}
                    columns={table.headers.map((h) => h.name)}
                    rows={table.rows}
                />
            ))}
        </div>
    )
}

Display.propTypes = {
    dataSetId: PropTypes.string,
}

export { Display }
