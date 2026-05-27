import { useDataEngine } from '@dhis2/app-runtime'
import PropTypes from 'prop-types'
import React, { createContext, useContext, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { APPROVAL_STATUSES } from '../../shared/index.js'

const ApprovalStatusesContext = createContext()

const useApprovalStatusesContext = () => useContext(ApprovalStatusesContext)

class ApprovalStatusesMap {
    constructor(map) {
        this._map = map || new Map()
    }

    _serialiseKey({ workflowId, periodId, orgUnitId, aocId }) {
        return `${workflowId}-${periodId}-${orgUnitId}-${aocId}`
    }

    set(key, status) {
        this._map.set(this._serialiseKey(key), status)
    }

    get(key) {
        return this._map.get(this._serialiseKey(key))
    }

    clone() {
        return new ApprovalStatusesMap(new Map(this._map))
    }
}

const useFetchApprovalStatus = ({ updateApprovalStatuses }) => {
    const engine = useDataEngine()
    const requestQueue = useRef([])
    const fetchApprovalStatuses = useDebouncedCallback(() => {
        const batchedQueries = []
        requestQueue.current.forEach((query) => {
            const existingBatchedQuery = batchedQueries.find(
                ({ workflowId, periodId }) => {
                    return (
                        workflowId === query.workflowId &&
                        periodId === query.periodId
                    )
                }
            )
            if (existingBatchedQuery) {
                existingBatchedQuery.orgUnitIds.push(query.orgUnitId)
            } else {
                batchedQueries.push({
                    workflowId: query.workflowId,
                    periodId: query.periodId,
                    orgUnitIds: [query.orgUnitId],
                    aocId: query.aocId,
                })
            }
        })
        requestQueue.current = []

        batchedQueries.forEach(
            async ({ workflowId, periodId, orgUnitIds, aocId }) => {
                updateApprovalStatuses({
                    periodId,
                    workflowId,
                    aocId,
                    approvalStatusUpdates: orgUnitIds.reduce(
                        (statuses, orgUnitId) => {
                            statuses[orgUnitId] = APPROVAL_STATUSES.LOADING
                            return statuses
                        },
                        {}
                    ),
                })

                const updateObject = {}
                try {
                    const { approvalStatuses } = await engine.query({
                        approvalStatuses: {
                            resource: 'dataApprovals/approvals',
                            params: {
                                wf: workflowId,
                                pe: periodId,
                                ou: orgUnitIds,
                                aoc: aocId,
                            },
                        },
                    })
                    approvalStatuses.forEach(({ ou, state }) => {
                        updateObject[ou] =
                            state || APPROVAL_STATUSES.UNAPPROVABLE
                    })
                } catch (error) {
                    console.error('Failed to fetch approval statuses:', error)
                    for (const orgUnitId of orgUnitIds) {
                        updateObject[orgUnitId] = APPROVAL_STATUSES.ERROR
                    }
                }
                updateApprovalStatuses({
                    periodId,
                    workflowId,
                    aocId,
                    approvalStatusUpdates: updateObject,
                })
            }
        )
    }, 10)

    return ({ workflowId, periodId, orgUnitId, aocId }) => {
        requestQueue.current.push({
            periodId,
            workflowId,
            orgUnitId,
            aocId,
        })
        fetchApprovalStatuses()
    }
}

export const ApprovalStatusesProvider = ({ children }) => {
    const [approvalStatuses, setApprovalStatuses] = useState(
        new ApprovalStatusesMap()
    )
    const updateApprovalStatuses = ({
        workflowId,
        periodId,
        aocId,
        approvalStatusUpdates,
    }) => {
        setApprovalStatuses((approvalStatuses) => {
            const newApprovalStatuses = approvalStatuses.clone()
            for (const [orgUnitId, status] of Object.entries(
                approvalStatusUpdates
            )) {
                newApprovalStatuses.set(
                    { workflowId, periodId, orgUnitId, aocId },
                    status
                )
            }
            return newApprovalStatuses
        })
    }
    const fetchApprovalStatus = useFetchApprovalStatus({
        updateApprovalStatuses,
    })

    return (
        <ApprovalStatusesContext.Provider
            value={{ approvalStatuses, fetchApprovalStatus }}
        >
            {children}
        </ApprovalStatusesContext.Provider>
    )
}

ApprovalStatusesProvider.propTypes = {
    children: PropTypes.node,
}

export const useApprovalStatus = () => {
    const { approvalStatuses, fetchApprovalStatus } =
        useApprovalStatusesContext()

    return {
        getApprovalStatus: ({ workflowId, periodId, orgUnitId, aocId }) => {
            return approvalStatuses.get({
                workflowId,
                periodId,
                orgUnitId,
                aocId,
            })
        },
        fetchApprovalStatus,
    }
}
