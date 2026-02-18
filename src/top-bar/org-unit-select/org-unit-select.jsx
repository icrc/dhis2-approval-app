import i18n from '@dhis2/d2-i18n'
import { OrganisationUnitTree, Divider } from '@dhis2/ui'
import React from 'react'
import { useAppContext } from '../../app-context/index.js'
import { useSelectionContext } from '../../selection-context/index.js'
import { ContextSelect } from '../context-select/index.js'
import { ApprovalStatusIconsLegend } from './approval-status-icons-legend.jsx'
import { ApprovalStatusLabel } from './approval-status-label.jsx'
import classes from './org-unit-select.module.css'

export const ORG_UNIT = 'ORG_UNIT'

const OrgUnitSelect = () => {
    const { organisationUnits } = useAppContext()
    const {
        orgUnit,
        selectOrgUnit,
        workflow,
        period,
        openedSelect,
        setOpenedSelect,
        attributeOptionCombo,
    } = useSelectionContext()
    const open = openedSelect === ORG_UNIT
    const value = orgUnit?.displayName
    const roots = organisationUnits.map(({ id }) => id)
    const onChange = ({ displayName, id, path }) => {
        selectOrgUnit({ displayName, id, path })
    }
    const selectedOrgUnitPath = orgUnit?.path ? [orgUnit.path] : undefined
    const initiallySelected =
        selectedOrgUnitPath || organisationUnits.map(({ path }) => path)


    const getRequiredValuesMessage = () => {
        if (!workflow?.id) {
            return i18n.t('Choose a workflow, a period and a category option combo first')
        }
        if (!period) {
            return i18n.t('Choose a period and a category option combo first')
        }
        if (!attributeOptionCombo) {
            return i18n.t('Choose a category option combo first')
        }
        return null;
    }

    return (
        <ContextSelect
            dataTest="org-unit-context-select"
            prefix={i18n.t('Organisation Unit')}
            placeholder={i18n.t('Choose an organisation unit')}
            value={value}
            open={open}
            disabled={!(workflow?.id && period?.id && attributeOptionCombo?.id)}
            onOpen={() => setOpenedSelect(ORG_UNIT)}
            onClose={() => setOpenedSelect('')}
            requiredValuesMessage={getRequiredValuesMessage()}
            popoverMaxWidth={400}
        >
            <div className={classes.popoverContainer}>
                <div className={classes.scrollbox}>
                    <OrganisationUnitTree
                        roots={roots}
                        onChange={onChange}
                        initiallyExpanded={initiallySelected}
                        selected={selectedOrgUnitPath}
                        singleSelection
                        renderNodeLabel={({ label, node }) => (
                            <ApprovalStatusLabel
                                label={label}
                                orgUnitId={node.id}
                            />
                        )}
                    />
                </div>
                <Divider margin="0" />
                <ApprovalStatusIconsLegend />
            </div>
        </ContextSelect>
    )
}

export { OrgUnitSelect }
