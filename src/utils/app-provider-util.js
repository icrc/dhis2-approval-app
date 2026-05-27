import { cloneJSON, sortList } from './array-utils.js'

export const normalizeMetadata = (
    originalCatCombos,
    originalCategories,
    originalCategoryOptionCombos
) => {
    const categoryCombos = normalizeCatCombos(originalCatCombos)
    const categoryMap = normalizeCategoriesAndOptions(originalCategories)

    const metadata = {
        categoryCombos,
        categories: categoryMap.categories,
        categoryOptions: categoryMap.categoryOptions,
    }

    const categoryOptionCombos = normalizeCategoryOptionCombos(
        originalCategoryOptionCombos,
        metadata
    )
    metadata.categoryOptionCombos = categoryOptionCombos

    return metadata
}

/**
 *
 * @param originalCatCombos
 * @returns {
        categoryCombos: {
            <combo_id_1>: {
                id: 'combo_id_1',
                displayName: 'Combo 1',
                isDefault: <true/false>,
                categoryIds: ['cat1', 'cat2'], // Array of category IDs
            }, ...
        }
    }
 */
const normalizeCatCombos = (originalCatCombos) => {
    const categoryCombos = Object.fromEntries(
        originalCatCombos
            .map((catCombo) => [
                catCombo.id,
                {
                    ...catCombo,
                    categoryIds: catCombo.categories.map((c) => c.id),
                },
            ])
            .map(([id, combo]) => [id, omitField(combo, 'categories')])
    )

    return categoryCombos
}

/**
 *
 * @param originalCategories: List of categories
 * @returns {
 *      categories : {
            <category_id_1>: {
                id: 'category_id_1',
                displayName: 'Age Group',
                categoryOptionIds: ["opt1", "opt2"]
            },
            ...
        }
        "categoryOptions": {
            <category-option-id-1>: {
                id: <category-option-id-1>,
                displayName: 'Under 5',
                organisationUnits: [{id: <ou_id_1>, path: <ou_path>}, ...]
            },...
        },
*/
const normalizeCategoriesAndOptions = (originalCategories) => {
    const normalized = { categories: {}, categoryOptions: {} }
    for (const category of originalCategories) {
        // Map each unique categoryOption by ID
        const options = cloneJSON(category.categoryOptions || [])
        for (const option of options) {
            const found = normalized.categoryOptions[option.id]
            if (!found) {
                normalized.categoryOptions[option.id] = option
            }
        }

        // Map category by ID
        const categoryOptionIds = options.map((item) => item.id)
        delete category.categoryOptions
        normalized.categories[category.id] = {
            ...category,
            categoryOptionIds,
        }
    }

    return normalized
}

/**
 *
 * @param originalCatCombos: List of category combos
 * @returns {
        <cat_option_combo_id_1>: {
            id: cat_option_combo_id_1,
            breakdown: [{ categoryId, optionId }],
            categoryOptionIds: ["catOption_id_1", "catOption_id_2"],
            categoryComboId: "cat_combo_id_1"
        }, ...
    }
*/
const normalizeCategoryOptionCombos = (
    originalCategoryOptionCombos,
    metadata
) => {
    const categoryOptionCombos = {}

    for (const categoryOptionCombo of originalCategoryOptionCombos) {
        const comboId = categoryOptionCombo.categoryCombo.id
        const optionIds = categoryOptionCombo.categoryOptions.map(
            (opt) => opt.id
        )
        sortList(optionIds)

        const breakdown = []
        const combo = metadata.categoryCombos[comboId]

        for (const catId of combo.categoryIds) {
            const category = metadata.categories[catId]
            const matchedOptionId = category.categoryOptionIds.find((optId) =>
                optionIds.includes(optId)
            )

            if (matchedOptionId) {
                breakdown.push({
                    categoryId: catId,
                    optionId: matchedOptionId,
                })
            }
        }

        categoryOptionCombos[categoryOptionCombo.id] = {
            ...categoryOptionCombo,
            categoryComboId: comboId,
            categoryOptionIds: optionIds,
            breakdown,
        }
    }

    return categoryOptionCombos
}

// Helper to remove a field
const omitField = (obj, keyToRemove) => {
    // eslint-disable-next-line no-unused-vars
    const { [keyToRemove]: _, ...rest } = obj
    return rest
}
