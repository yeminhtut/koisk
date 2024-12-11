import React from "react";

const RadioOption = ({
    group,
    option,
    isChecked,
    handleChange,
    getChecked,
}) => (
    <div className="field-radiobutton flex">
        <label className="custom-radio">
            <input
                type="radio"
                name={group.addon}
                value={option.productpricecode}
                checked={isChecked}
                onChange={handleChange}
                className="hidden-radio"
            />
            <span
                className={`radiomark ${getChecked(option) ? "checked" : ""}`}
            ></span>
        </label>
        <label htmlFor={`${group.addon}_${option.id}`}>
            {option?.articlefields?.title}
        </label>
        <div className="ml-auto">
            {option?.price > 0 ? `+ ${option.price.toFixed(2)}` : ""}
        </div>
    </div>
);

const CheckboxOption = ({
    group,
    option,
    isChecked,
    handleChange,
    getChecked,
}) => (
    <div className="field-radiobutton flex">
        <label className="custom-checkbox">
            <input
                type="checkbox"
                value={option.productpricecode}
                checked={isChecked}
                onChange={handleChange}
                className="hidden-checkbox"
            />
            <span
                className={`checkmark ${getChecked(option) ? "checked" : ""}`}
            ></span>
        </label>
        <label htmlFor={`${group.addon}_${option.id}`}>
            {option?.articlefields?.title}
        </label>
        <div className="ml-auto">
            {option?.price > 0 ? `+ ${option.price.toFixed(2)}` : ""}
        </div>
    </div>
);

const ProductAddon = ({
    productAddons,
    selectedOptions,
    handleRadioOptionChange,
    handleOptionChange
}) => {
    const getChecked = (option) => {
        return selectedOptions.some((item) =>
            Object.values(item).includes(option.productpricecode),
        );
    };
    const getParentGroup = () => {
        return true
    }
    return (
        <div>
            {productAddons.map((group, i) => (
                    <div key={i} className="field px-4">
                        <h4>{group.addgroup.title}</h4>
                        {group.addons.map((option, index) => {
                            const isChecked = selectedOptions.some((item) =>
                                Object.values(item).includes(
                                    option.productpricecode,
                                ),
                            );
                            return (
                                <div key={index}>
                                    {group.addgroup.multiselect !== "Y" && (
                                        <RadioOption
                                            group={group}
                                            option={option}
                                            isChecked={isChecked}
                                            handleChange={() =>
                                                handleRadioOptionChange(
                                                    group,
                                                    option,
                                                    index,
                                                )
                                            }
                                            getChecked={getChecked}
                                        />
                                    )}
                                    {group.addgroup.multiselect === "Y" &&
                                        getParentGroup(option) && (
                                            <CheckboxOption
                                                group={group}
                                                option={option}
                                                isChecked={isChecked}
                                                handleChange={() =>
                                                    handleOptionChange(
                                                        group.addon,
                                                        option,
                                                        option.productpricecode,
                                                        group,
                                                    )
                                                }
                                                getChecked={getChecked}
                                            />
                                        )}
                                </div>
                            );
                        })}
                    </div>
                ))}
        </div>
    );
};

export default ProductAddon;
