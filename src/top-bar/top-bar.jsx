import React from 'react'
import { AttributeComboSelect } from './attribute-combo-select/attribute-combo-select.jsx'
import { ClearAllButton } from './clear-all-button/index.js'
import { ApprovalStatusesProvider } from './org-unit-select/approval-statuses.jsx'
import { OrgUnitSelect } from './org-unit-select/index.js'
import { PeriodSelect } from './period-select/index.js'
import { WorkflowSelect } from './workflow-select/index.js'

const TopBar = () => (
    <>
        <WorkflowSelect />
        <PeriodSelect />
        <AttributeComboSelect />
        <ApprovalStatusesProvider>
            <OrgUnitSelect />
        </ApprovalStatusesProvider>
        <ClearAllButton />
    </>
)

export { TopBar }
