import { areListsEqual, cloneJSON } from './array-utils.js'
import { isDateALessThanDateB } from './date-utils.js'

export const getCategoryCombosByFilters = (
    metadata,
    { workflow, period, calendar }
) => {
    if (workflow == null || period == null) {
        return []
    }

    const categoryComboList = cloneJSON(
        getCategoryComboByDataSet(workflow, metadata)
    )
    // Filter category options by orgunit and period
    return categoryComboList
        .map((categoryCombo) => {
            return filterValidCategoryOptions({
                categoryCombo,
                metadata,
                period,
                calendar,
            })
        })
        .filter((combo) => combo.categoryIds.length > 0)
}

export const getAttributeComboById = (metadata, attributeComboId) => {
    return metadata.categoryCombos?.[attributeComboId]
}

export const extractValidCatComboAndCatOptionCombo = (
    metadata,
    selection = {}
) => {
    const { workflow, aoc, period, calendar } = selection

    if (!workflow?.dataSets?.length) {
        return null
    }

    const categoryOptionCombo = metadata.categoryOptionCombos[aoc]
    if (!categoryOptionCombo) {
        return null
    }

    const datasetHasMatchingCatCombo = workflow.dataSets.find(
        (ds) => ds.categoryCombo.id === categoryOptionCombo?.categoryComboId
    )
    if (!datasetHasMatchingCatCombo) {
        return null
    }

    const categoryCombo = cloneJSON(
        getAttributeComboById(metadata, categoryOptionCombo.categoryComboId)
    )

    const isValid = isCategoryOptionComboValid({
        aoc,
        metadata,
        period,
        calendar,
    })

    if (!isValid) {
        return null
    }

    return {
        attributeCombo: categoryCombo,
        attributeOptionCombo: categoryOptionCombo,
    }
}

export const getDataSetReportFilter = (
    metadata,
    { attributeCombo, attributeOptionCombo, period, calendar }
) => {
    if (
        !attributeOptionCombo?.categoryOptionIds?.length ||
        !attributeCombo ||
        attributeCombo.isDefault
    ) {
        return null
    }

    // Map categoryOptions to category-option pairs
    const filter = []
    const categoryCombo = getAttributeComboById(
        metadata,
        attributeOptionCombo.categoryComboId
    )
    const categories = getCategoriesByCategoryCombo({
        categoryCombo,
        metadata,
        period,
        calendar,
    })
    for (const category of categories) {
        const matchedOptionId = category.categoryOptionIds.find((optionId) =>
            attributeOptionCombo.categoryOptionIds.includes(optionId)
        )

        if (matchedOptionId) {
            filter.push(`${category.id}:${matchedOptionId}`)
        }
    }

    return filter
}

export const filterDataSetsByAttributeOptionComboAndOrgUnit = (
    metadata,
    { workflow, orgUnit, attributeOptionCombo }
) => {
    const result = []

    if (attributeOptionCombo) {
        const dataSets = cloneJSON(workflow?.dataSets)
        const catCombo = getAttributeComboById(
            metadata,
            attributeOptionCombo.categoryComboId
        )
        for (const dataSet of dataSets) {
            // Check if the data set assigned to "categoryCombo"
            const checkAttrOptionCombo =
                catCombo.id === dataSet.categoryCombo.id

            // Check if the data set assigned to "orgUnit"
            const checkOrgunit = dataSet.organisationUnits.find((dsOrgUnit) =>
                dsOrgUnit.path.includes(orgUnit?.path)
            )

            if (checkAttrOptionCombo && checkOrgunit) {
                result.push(dataSet)
            }
        }
    }

    return result
}

/**
 *
 * @param {*} categoryCombo
 * @param {*} categoryOptionMap {<category_id>: <category_option_id>, ...}
 * @returns
 */
export const findAttributeOptionCombo = (metadata, categoryOptionMap) => {
    const selectedOptionIds = Object.values(categoryOptionMap) // Get the selected category list

    return (
        Object.values(metadata.categoryOptionCombos).find((catOptionCombo) =>
            areListsEqual(catOptionCombo.categoryOptionIds, selectedOptionIds)
        ) || null
    )
}

export const getCategoriesByCategoryCombo = ({
    categoryCombo,
    metadata,
    period,
    calendar,
}) => {
    if (!categoryCombo?.categoryIds?.length) {
        return []
    }

    const updatedCategories = categoryCombo.categoryIds.map((categoryId) => {
        const category = metadata.categories[categoryId]

        if (!category?.categoryOptionIds?.length) {
            return category
        }

        const filteredOptionIds = category.categoryOptionIds.filter(
            (catOptionId) => {
                const categoryOption = metadata.categoryOptions[catOptionId]
                return isCategoryOptionValid({
                    categoryOption,
                    period,
                    calendar,
                })
            }
        )

        return {
            ...category,
            categoryOptionIds: filteredOptionIds,
        }
    })

    return updatedCategories
}

const getCategoryComboByDataSet = (workflow, metadata) => {
    if (!workflow?.dataSets?.length) {
        return []
    }

    const uniqueComboIds = Array.from(
        new Set(workflow.dataSets.map((ds) => ds?.categoryCombo?.id))
    )

    return uniqueComboIds.map((id) => getAttributeComboById(metadata, id))
}

const isOptionWithinPeriod = ({
    period,
    categoryOption,
    calendar = 'gregory',
}) => {
    const { startDate: periodStartDate, endDate: periodEndDate } = period
    const {
        startDate: categoryOptionStartDate,
        endDate: categoryOptionEndDate,
    } = categoryOption

    // option has not start and end dates
    if (!categoryOptionStartDate && !categoryOptionEndDate) {
        return true
    }

    let startDateValid = true
    let endDateValid = true

    // catOption.startDate <= period.startDate
    if (categoryOptionStartDate) {
        startDateValid = isDateALessThanDateB(
            { date: categoryOptionStartDate, calendar: 'gregory' },
            { date: periodStartDate, calendar },
            {
                calendar,
                inclusive: true,
            }
        )
    }

    // period.endDate<=catOption.endDate
    if (categoryOptionEndDate) {
        endDateValid = isDateALessThanDateB(
            { date: periodEndDate, calendar },
            { date: categoryOptionEndDate, calendar: 'gregory' },
            {
                calendar,
                inclusive: true,
            }
        )
    }

    return startDateValid && endDateValid
}

const filterValidCategoryOptions = ({
    metadata,
    categoryCombo,
    period,
    calendar,
}) => {
    if (!categoryCombo?.categoryIds?.length || !period) {
        return
    }

    const updatedCategories = getCategoriesByCategoryCombo({
        categoryCombo,
        metadata,
        period,
        calendar,
    })

    // Update categoryCombo.categoryIds to only include categories with options
    categoryCombo.categoryIds = categoryCombo.categoryIds.filter((id) => {
        const category = updatedCategories.find((cat) => cat.id === id)
        return category && category.categoryOptionIds.length > 0
    })

    return categoryCombo
}

const isCategoryOptionComboValid = ({ aoc, metadata, period, calendar }) => {
    const catMap = metadata.categoryOptionCombos[aoc].breakdown

    return catMap.every(({ optionId }) => {
        const categoryOption = metadata.categoryOptions[optionId]
        return isCategoryOptionValid({
            categoryOption,
            period,
            calendar,
        })
    })
}

const isCategoryOptionValid = ({ categoryOption, period, calendar }) => {
    return isOptionWithinPeriod({ categoryOption, period, calendar })
}
