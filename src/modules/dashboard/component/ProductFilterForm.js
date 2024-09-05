import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';

const ProductFilterForm = (props) => {
    const [selectedCities, setSelectedCities] = useState(null);
    const [date, setDate] = useState();
    const cities = [
        { name: 'Delivery', code: 'NY' },
        { name: 'Pick up', code: 'RM' },
        { name: 'Dine in', code: 'LDN' },
    ];
    const { handleSearch } = props;
    const formik = useFormik({
        initialValues: {
            q: '',
        },
        onSubmit: (values) => {
            handleSearch(values);
        },
    });

    const renderFormArea = () => {
        return (
            <div className='grid'>
                <div className='col-2'>
                    <p>Showing recent 5 orders</p>
                </div>
                <div className='col-10'>
                <div className="grid w-full">
                <div className="col-2">
                    <MultiSelect
                        itemCheckboxIcon={false}
                        value={selectedCities}
                        onChange={(e) => setSelectedCities(e.value)}
                        options={cities}
                        optionLabel="name"
                        placeholder="Order Channels"
                        maxSelectedLabels={3}
                        className="w-full"
                    />
                </div>
                <div className="col-2">
                    <MultiSelect
                        itemCheckboxIcon={false}
                        value={selectedCities}
                        onChange={(e) => setSelectedCities(e.value)}
                        options={cities}
                        optionLabel="name"
                        placeholder="Order Type"
                        maxSelectedLabels={3}
                        className="w-full"
                    />
                </div>
                <div className="col-2">
                    <Calendar
                        className="w-full"
                        value={date}
                        onChange={(e) => setDate(e.value)}
                        showIcon
                    />
                </div>
                <div className="col-2">
                    <MultiSelect
                        itemCheckboxIcon={false}
                        value={selectedCities}
                        onChange={(e) => setSelectedCities(e.value)}
                        options={cities}
                        optionLabel="name"
                        placeholder="Show (Recent)"
                        maxSelectedLabels={3}
                        className="w-full"
                    />
                </div>
                <div className="col-2">
                    <div className="p-inputgroup">
                        <InputText placeholder="Search" />
                        <span className="p-inputgroup-addon">
                            <i className="pi pi-search"></i>
                        </span>
                    </div>
                </div>
            </div>
                </div>
            </div>
        );
    };
    return (
        <form onSubmit={formik.handleSubmit} className="w-full">
            {renderFormArea()}
        </form>
    );
};

export default ProductFilterForm;
