import * as React from 'react';
import {
    Step,
    Stepper,
    StepLabel,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import styles from './horizontal-linear-stepper.style';

class HorizontalLinearStepper extends React.Component<any, any> {

    constructor(props) {
        super(props);
    }

    state = {
        finished: false,
        stepIndex: 0,
    };

    handleNext = () => {
        const {stepIndex} = this.state;
        this.setState({
            stepIndex: stepIndex + 1,
            finished: stepIndex >= 2,
        });
    };

    handlePrev = () => {
        let {stepIndex} = this.state;
        if (stepIndex > 0) {
            stepIndex--;
            this.setState({stepIndex});
        }
    };

    resetHandle = (event) => {
        event.preventDefault();

        this.setState({
            stepIndex: 0,
            finished: false
        });
    };

    render() {

        const {finished, stepIndex} = this.state;
        const {getStepContent, children} = this.props;

        let buttonsPanelBody: JSX.Element;
        if (finished) {
            buttonsPanelBody = (
                <p><a href="" onClick={ this.resetHandle }>Вернуться</a></p>
            );

        } else {

            const {handlePrev, handleNext} = this;
            const props = {
                stepIndex,
                handlePrev,
                handleNext
            };

            buttonsPanelBody = <ButtonsPanel {...props} />;
        }

        return (
            <div style={ styles.main }>
                <Stepper activeStep={stepIndex}>
                    { children }
                </Stepper>

                <div style={styles.content} className="buttons-panel">
                    <div>
                        {getStepContent(stepIndex)}
                        { buttonsPanelBody }
                    </div>
                </div>
            </div>
        );
    }
}

export default HorizontalLinearStepper;

const ButtonsPanel = (props) => {

    const {
        handlePrev,
        handleNext,
        stepIndex
    } = props;

    return (
        <div style={{marginTop: 12}}>
            <FlatButton
                label="Back"
                disabled={stepIndex === 0}
                onTouchTap={handlePrev}
                style={styles.buttons.prev}
            />
            <RaisedButton
                label={stepIndex === 2 ? 'Finish' : 'Next'}
                primary={true}
                onTouchTap={handleNext}
            />
        </div>
    );
};