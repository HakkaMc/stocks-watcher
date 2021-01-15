import React, {useCallback, useState} from 'react'
import { useForm } from 'react-hook-form'
import {Button, Checkbox, IconButton} from '@material-ui/core'
import { Save as SaveIcon } from '@material-ui/icons';
import {Input} from "../../../../../../form";
import styles from './styles.module.scss'

type FormValues = {
    newFlag: string
}

export const Flags = () => {
    const [show, setShow] = useState(false)
    const [flags, setFlags] = useState([{name: 'jmeno',checked: false}])
    const form = useForm<FormValues>()

    const change = useCallback((flag:string)=> () =>{

    }, [])

    const toggleShow = useCallback(()=>{
        setShow(!show)
    }, [show])

    const save = useCallback(()=>{
        const {newFlag} = form.getValues()
            if(newFlag) {
                setFlags([
                    ...flags,
                    {
                        name: newFlag,
                        checked: true
                    }
                ])
            }
        setShow(false)
    }, [form])

    return <div className={styles.flags}>
        <div>
            <Button color="primary" onClick={toggleShow}>Flags</Button>
        </div>
        {show && <div className={styles.floatingContainer}>
            <div>
                <table>
                    <tbody>
                    {flags.map(flag=>
                            <tr key={flag.name}>
                                <td>{flag.name}</td>
                                <td>
                                    <Checkbox
                                        checked={flag.checked}
                                        name={flag.name}
                                        color="primary"
                                        onChange={change(flag.name)}
                                    />
                                </td>
                            </tr>
                    )}
                    </tbody>
                </table>
                <div className={styles.newFlagContainer}>
                    <Input form={form} name="newFlag" placeholder="New flag"/>
                    <IconButton onClick={save}>
                        <SaveIcon color="primary"/>
                    </IconButton>
                </div>
            </div>
        </div>}
    </div>
}
