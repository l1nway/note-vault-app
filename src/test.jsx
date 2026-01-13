import {useState} from 'react'
import Select from './select.jsx'

function Test() {

    const [value, setValue] = useState('6')
    const apples = [
        {disabled: true},
        {2:2},
        {4:5},
        'вась',
        {name: 'ivan', id: 'semen'},
        '',
        setValue,
        true,
        false,
        0,
        '0',
        1,
        '0',
        3,
        '3'
    ]

    return (
        <>
            <Select
                options={apples}
                onChange={setValue}
                // defaultValue={'7'}
                value={value}
            />
        </>
    )
}

export default Test