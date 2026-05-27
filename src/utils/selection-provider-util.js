import i18n from '@dhis2/d2-i18n'
import {
    findAttributeOptionCombo,
    extractValidCatComboAndCatOptionCombo,
    getCategoryCombosByFilters,
    getAttributeComboById,
    getCategoriesByCategoryCombo,
} from './category-combo-utils.js'

const getAttributeOptionComboData = (
    metadata,
    { workflow, aoc, period, calendar }
) => {
    return extractValidCatComboAndCatOptionCombo(metadata, {
        workflow,
        aoc,
        period,
        calendar,
    })
}

export const handleSelectWorkflow = (state, payload) => {
    const attributeOptionComboData = getAttributeOptionComboData(
        payload.metadata,
        {
            workflow: payload.workflow,
            aoc: state.attributeOptionCombo?.id,
            period: state.period,
            calendar: payload.calendar,
        }
    )

    const samePeriodType =
        state.workflow?.periodType === payload.workflow?.periodType

    return {
        ...state,
        openedSelect: '',
        workflow: payload.workflow,
        period:
            state.workflow?.dataSets?.length > 0 && samePeriodType
                ? state.period
                : null,
        attributeCombo: state.attributeCombo
            ? attributeOptionComboData?.attributeCombo
            : null,
        attributeOptionCombo: state.attributeOptionCombo
            ? attributeOptionComboData?.attributeOptionCombo
            : null,
        dataSet: null,
    }
}

export const handleSelectPeriod = (state, payload) => {
    const attributeOptionComboData = getAttributeOptionComboData(
        payload.metadata,
        {
            workflow: state.workflow,
            aoc: state.attributeOptionCombo?.id,
            period: payload.period,
            calendar: payload.calendar,
        }
    )

    return {
        ...state,
        ...attributeOptionComboData,
        openedSelect: payload.period?.id ? '' : state.openedSelect,
        period: payload.period,
        dataSet: null,
    }
}

export const handleSelectCatOptionCombo = (state, payload) => {
    return {
        ...state,
        attributeCombo: payload.attributeCombo,
        attributeOptionCombo: null,
        dataSet: null,
    }
}

export const handleSelectOrgUnit = (state, payload) => {
    return {
        ...state,
        openedSelect: '',
        orgUnit: payload.orgUnit,
        dataSet: null,
    }
}

const shouldShowAttributeCombo = ({
    workflow,
    period,
    attributeCombos,
    selectedAttrCombo,
    metadata,
    calendar,
}) => {
    if (!(workflow?.dataSets?.length > 0 && period?.id)) {
        return false
    }

    if (attributeCombos.length === 0) {
        return false
    }

    if (selectedAttrCombo?.isDefault) {
        return false
    }

    const [singleCategoryCombo] = attributeCombos
    const categories = getCategoriesByCategoryCombo({
        categoryCombo: singleCategoryCombo,
        metadata,
        period,
        calendar,
    })
    const [firstCategory] = categories
    if (
        attributeCombos.length == 1 &&
        singleCategoryCombo.categoryIds?.length === 1 &&
        firstCategory.categoryOptionIds?.length <= 1
    ) {
        return false
    }

    return true
}

export const getAttributeComboState = ({
    metadata,
    workflow,
    period,
    calendar,
    attributeCombo,
    attributeOptionCombo,
}) => {
    const _attributeCombos = getCategoryCombosByFilters(metadata, {
        workflow,
        period,
        calendar,
    })

    let _attributeCombo = attributeCombo
    let _attributeOptionCombo = null
    const isVisible = shouldShowAttributeCombo({
        workflow,
        period,
        attributeCombos: _attributeCombos,
        attributeCombo: _attributeCombo,
        metadata,
        calendar,
    })
    let attributeComboValue = i18n.t('0 selections')

    const processCategoryOptions = (metadata, attributeOptionCombo) => {
        return attributeOptionCombo.categoryOptionIds.map(
            (catOptionId) => metadata.categoryOptions[catOptionId]
        )
    }

    const getAttributeOptionComboValue = (
        selectedAttrCombo,
        selectedCategoryItems
    ) => {
        if (selectedAttrCombo?.isDefault) {
            return ''
        }

        if (
            !Object.values(selectedCategoryItems).length ||
            !selectedAttrCombo
        ) {
            return i18n.t('0 selections')
        }

        const amount = Object.values(selectedCategoryItems).length
        if (amount === 1) {
            return i18n.t('1 selection')
        }

        return i18n.t('{{amount}} selections', { amount })
    }

    if (_attributeCombos.length === 0) {
        _attributeCombo = null
        attributeComboValue = i18n.t('[No options]')
    } else if (attributeOptionCombo) {
        const selectedAttrCombo = getAttributeComboById(
            metadata,
            attributeOptionCombo.categoryComboId
        )
        const selectedAttrOptionCombo = attributeOptionCombo
        const categoryOptions = processCategoryOptions(
            metadata,
            attributeOptionCombo
        )
        const value = getAttributeOptionComboValue(
            selectedAttrCombo,
            categoryOptions
        )
        _attributeCombo = selectedAttrCombo
        _attributeOptionCombo = selectedAttrOptionCombo
        attributeComboValue = value
    } else if (_attributeCombos.length === 1) {
        const [singleCategoryCombo] = _attributeCombos
        const categories = getCategoriesByCategoryCombo({
            categoryCombo: singleCategoryCombo,
            metadata,
            period,
            calendar,
        })
        const [firstCategory] = categories

        if (
            singleCategoryCombo.categoryIds?.length === 1 &&
            firstCategory.categoryOptionIds?.length === 1
        ) {
            const categoryId = singleCategoryCombo.categoryIds[0]
            const categoryOptionMap = {}
            categoryOptionMap[categoryId] = firstCategory.categoryOptionIds[0]
            _attributeOptionCombo = findAttributeOptionCombo(
                metadata,
                categoryOptionMap
            )
            _attributeCombo = singleCategoryCombo
            attributeComboValue = i18n.t('1 selection')
        } else {
            _attributeCombo = singleCategoryCombo
            attributeComboValue = i18n.t('0 selection')
        }
    }

    return {
        attributeCombos: _attributeCombos,
        attributeCombo: _attributeCombo,
        attributeOptionCombo: _attributeOptionCombo,
        isVisible,
        attrComboValue: attributeComboValue,
    }
}
