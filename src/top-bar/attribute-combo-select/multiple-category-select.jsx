import i18n from '@dhis2/d2-i18n'
import { NoticeBox, SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { useAppContext } from '../../app-context/use-app-context.js'
import css from './category-option-select.module.css'

/**
 *
 * @param categories Category list
 * @param selected {<categoryId_1>: <catOptionId_1>, <categoryId_2>: <catOptionId_2>, ...}
 * @param onChange A function to handle changes in the selected options.
 *
 */
export default function MultipleCategorySelect({
    categories,
    selected,
    onChange,
}) {
    const { metadata } = useAppContext()

    return (
        <>
            {/* Categories Dropdown */}
            {categories.map(({ id, displayName, categoryOptionIds }) =>
                categoryOptionIds.length === 0 ? (
                    <NoticeBox
                        key={`notice_${id}`}
                        className={css.noOptionsBox}
                        error
                        title={i18n.t('No available options')}
                    >
                        {i18n.t(
                            `There are no options for {{categoryName}} for the selected period or organisation unit.`,
                            { categoryName: displayName }
                        )}
                    </NoticeBox>
                ) : (
                    <div key={id} className={css.selectContainer}>
                        <SingleSelectField
                            filterable
                            label={displayName}
                            noMatchText={i18n.t('No options found')}
                            selected={selected[id] ?? undefined}
                            onChange={(selectedItem) =>
                                onChange(id, selectedItem.selected)
                            }
                            filterPlaceholder={i18n.t('Type to filter options')}
                        >
                            {categoryOptionIds.map((id) => {
                                const categoryOption =
                                    metadata.categoryOptions[id]
                                return (
                                    <SingleSelectOption
                                        key={categoryOption.id}
                                        label={categoryOption.displayName}
                                        value={categoryOption.id}
                                    />
                                )
                            })}
                        </SingleSelectField>
                    </div>
                )
            )}
        </>
    )
}

MultipleCategorySelect.propTypes = {
    categories: PropTypes.arrayOf(
        PropTypes.shape({
            categoryOptionIds: PropTypes.arrayOf(PropTypes.string).isRequired,
            displayName: PropTypes.string.isRequired,
            id: PropTypes.string.isRequired,
        })
    ).isRequired,

    onChange: PropTypes.func.isRequired,
    selected: PropTypes.object,
}
