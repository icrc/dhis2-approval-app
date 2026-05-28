import i18n from '@dhis2/d2-i18n'
import { IconWarning16, colors, Tooltip } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useSelectionContext } from '../../selection-context/index.js'
import { ApprovalStatusIcon, APPROVAL_STATUSES } from '../../shared/index.js'
import classes from './approval-status-label.module.css'
import { useApprovalStatus } from './approval-statuses.jsx'

const renderIcon = (approvalStatus) => {
    if (approvalStatus === APPROVAL_STATUSES.LOADING) {
        return <span className={classes.loadingIcon}></span>
    } else if (approvalStatus === APPROVAL_STATUSES.ERROR) {
        return (
            <Tooltip content={i18n.t('Failed to load approval state')}>
                {({ onMouseOver, onMouseOut, ref }) => (
                    <span
                        className={classes.iconContainer}
                        onMouseOver={onMouseOver}
                        onMouseOut={onMouseOut}
                        ref={ref}
                    >
                        <IconWarning16 color={colors.yellow500} />
                    </span>
                )}
            </Tooltip>
        )
    } else if (approvalStatus) {
        return <ApprovalStatusIcon approvalStatus={approvalStatus} />
    }
}

const ApprovalStatusLabel = ({ label, orgUnitId }) => {
    const { workflow, period, attributeOptionCombo } = useSelectionContext()
    const { getApprovalStatus, fetchApprovalStatus } = useApprovalStatus()
    const approvalStatus = getApprovalStatus({
        workflowId: workflow.id,
        periodId: period.id,
        orgUnitId,
        aocId: attributeOptionCombo?.id,
    })

    useEffect(() => {
        fetchApprovalStatus({
            workflowId: workflow.id,
            periodId: period.id,
            orgUnitId,
            aocId: attributeOptionCombo?.id,
        })
    }, [])

    return (
        <div className={classes.container}>
            {renderIcon(approvalStatus)}
            {label}
        </div>
    )
}

ApprovalStatusLabel.propTypes = {
    label: PropTypes.string.isRequired,
    orgUnitId: PropTypes.string.isRequired,
}

export { ApprovalStatusLabel }
