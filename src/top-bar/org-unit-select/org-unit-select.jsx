import i18n from '@dhis2/d2-i18n'
import { OrganisationUnitTree, Divider, InputField } from '@dhis2/ui'
import React from 'react'
import { useAppContext } from '../../app-context/index.js'
import { useSelectionContext } from '../../selection-context/index.js'
import { ContextSelect } from '../context-select/index.js'
import { ApprovalStatusIconsLegend } from './approval-status-icons-legend.jsx'
import { ApprovalStatusLabel } from './approval-status-label.jsx'
import classes from './org-unit-select.module.css'
import { useOrgUnitSearch } from './useOrgUnitSearch.js'
import { isNullOrEmpty } from '../../utils/string-utils.js'

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

    const { searchText, orgUnits, setSearchText } = useOrgUnitSearch()

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
            return i18n.t('Choose a workflow and period first')
        }
        if (!period) {
            return i18n.t('Choose a period first')
        }
        return null
    }

    const requiredValuesMessage = getRequiredValuesMessage()

    const renderOrgUnitTree = () => {
        const isSearching = !isNullOrEmpty(searchText)

        const roots = isSearching
            ? orgUnits.map(({ id }) => id)
            : organisationUnits.map(({ id }) => id)

        const treeKey = isSearching ? `${searchText}-${new Date().getTime()}` : 'initial';

        return (
            <OrganisationUnitTree
                dataTest="org-unit-selector-tree"
                key={treeKey}
                roots={roots}
                onChange={onChange}
                selected={selectedOrgUnitPath}
                singleSelection
                {...(!isSearching && { initiallyExpanded: initiallySelected })}
                renderNodeLabel={({ label, node }) => (
                    <ApprovalStatusLabel
                        label={label}
                        orgUnitId={node.id}
                    />
                )}
            />
        );
    }

    return (
        <ContextSelect
            dataTest="org-unit-context-select"
            prefix={i18n.t('Organisation Unit')}
            placeholder={i18n.t('Choose an organisation unit')}
            value={requiredValuesMessage === null ? value : ''}
            open={open}
            disabled={!(workflow?.id && period?.id && attributeOptionCombo?.id)}
            onOpen={() => setOpenedSelect(ORG_UNIT)}
            onClose={() => setOpenedSelect('')}
            requiredValuesMessage={getRequiredValuesMessage()}
            popoverMaxWidth={400}
        >
            <div className={classes.popoverContainer}>
 		<div className={classes.inputContainer}>
                    <InputField
                        dense
                        name="context-selection-org-unit-search"
                        placeholder={i18n.t('Search org units')}
                        value={searchText}
                        onChange={({ value: nextValue }) => setSearchText(nextValue)}
                        className={classes.searchInput}
                    />
                </div>

                <div className={classes.dividerContainer}>
                    <Divider dense />
                </div>

                <div className={classes.scrollbox}>
                    {renderOrgUnitTree()}
                </div>
                <Divider margin="0" />
                <ApprovalStatusIconsLegend />
            </div>
        </ContextSelect>
    )
}

export { OrgUnitSelect }
