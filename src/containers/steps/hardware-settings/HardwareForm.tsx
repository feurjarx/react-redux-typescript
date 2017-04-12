import * as React from "react";
import {composition} from '../../../helpers';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import InfoSlider from '../../../components/info-slider/InfoSlider';
import ReplicaTools from '../../../components/replic-tools/ReplicaTools';

class HardwareForm extends React.Component<any, any> {

    static defaultProps = {
        defaultValues: {}
    };

    constructor(props) {
        super(props);

        this.state = {
            sliderDisabled: false
        }
    }

    onCheckHandle = (event, checked) => {
        this.setState({
            sliderDisabled: checked
        })
    };

    render() {

        const {
            idx,
            total,
            masterIdx,
            onServerAdd,
            onCheckHandle,
            onSliderUpdate,
            onServerRemove,
            onTextFieldChange,
            defaultValues
        } = this.props;

        const {sliderDisabled} = this.state;

        const addable = idx === total - 1;
        const removeable = addable && total - 1;

        let checkbox: JSX.Element = null;
        if ([null, idx].indexOf(masterIdx) >= 0) {
            checkbox = (
                <Checkbox
                    defaultChecked={defaultValues.isMaster && idx === 0}
                    onCheck={composition(onCheckHandle, this.onCheckHandle)}
                    label="Master"
                    value={idx}
                    name={`servers.${idx}.isMaster`}
                    labelStyle={{color: 'rgba(0, 0, 0, 0.3)'}}
                />
            );
        }

        return (
            <ReplicaTools
                onReplicaAdd={onServerAdd}
                onReplicaRemove={onServerRemove}
                removeable={removeable}
                addable={addable}
            >
                <Paper style={{width: 400, padding: 10}} zDepth={3}>
                    <TextField
                        defaultValue={defaultValues.name}
                        name={`servers.${idx}.name`}
                        floatingLabelText="Наименование сервера"
                        onChange={onTextFieldChange}
                    />

                    <InfoSlider
                        label="Доступное пространство"
                        name={`servers.${idx}.hdd`}
                        shortSyntax='Гб'
                        min={2}
                        max={2000}
                        step={1}
                        defaultValue={defaultValues.hdd}
                        onChange={onSliderUpdate}
                    />

                    <InfoSlider
                        defaultValue={defaultValues.maxRegions}
                        label="Макс. число регионов"
                        name={`servers.${idx}.maxRegions`}
                        shortSyntax=""
                        max={20}
                        step={1}
                        onChange={onSliderUpdate}
                        disabled={sliderDisabled}
                    />

                    {/*
                     <InfoSlider
                         defaultValue={defaultValues.replicationNumber}
                         label="Кол-во репликаций"
                         name={`servers.${idx}.replicationNumber`}
                         shortSyntax=""
                         max={3}
                         step={1}
                         onChange={onSliderUpdate}
                     />
                    */}

                    <InfoSlider
                        defaultValue={defaultValues.pDie}
                        label="Вероятность отказа"
                        name={`servers.${idx}.pDie`}
                        shortSyntax="%"
                        min={0.1}
                        max={100}
                        step={0.1}
                        onChange={onSliderUpdate}
                    />

                    <InfoSlider
                        defaultValue={defaultValues.distanceToMasterKm}
                        label="Расстояние до master-сервера"
                        name={`servers.${idx}.distanceToMasterKm`}
                        shortSyntax='км'
                        min={0}
                        max={25000}
                        step={0.1}
                        disabled={sliderDisabled}
                        onChange={onSliderUpdate}
                    />

                    {checkbox}
                </Paper>
            </ReplicaTools>
        );
    }
}

export default HardwareForm;