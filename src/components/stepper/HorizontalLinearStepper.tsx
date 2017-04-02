import * as React from 'react';
import { Stepper } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import styles from './horizontal-linear-stepper.style';

class HorizontalLinearStepper extends React.Component<any, any> {

    constructor(props) {
        super(props);
    }

    state = {
        finished: false,
        stepIndex: 0
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
            this.setState({
                stepIndex,
                finished: false
            });
        }
    };

    handleReset = (event) => {
        event.preventDefault();

        this.setState({
            stepIndex: 0,
            finished: false
        });
    };

    render() {

        const { handleNext, handlePrev, handleReset } = this;
        const {children, steps} = this.props;
        const {finished, stepIndex} = this.state;

        const limit = children.length;
        const buttonsPanelProps = {
            handleReset,
            handlePrev,
            handleNext,
            stepIndex,
            finished,
            limit
        };

        const stepsContents = steps.map((step, i) => {

            const displayStyle = {
                display: stepIndex === i ? 'block' : 'none'
            };

            return (
                <div style={displayStyle} key={i}>
                    { stepIndex === i ? React.cloneElement(step, {active: true}) : step }
                </div>
            )
        });

        return (
            <div style={ styles.main }>
                <Stepper activeStep={stepIndex}>
                    { children }
                </Stepper>

                <div style={styles.content} className="stepper-content">
                    <div>
                        { stepsContents }
                        <ButtonsPanel {...buttonsPanelProps} />
                    </div>
                </div>
            </div>
        );
    }
}

export default HorizontalLinearStepper;

const ButtonsPanel = (props) => {

    const {
        handleReset,
        handlePrev,
        handleNext,
        stepIndex,
        limit,
        finished
    } = props;

    return (
        <div style={{marginTop: 15}}>
            <FlatButton
                label="Сначала"
                disabled={stepIndex === 0}
                onTouchTap={handleReset}
                style={styles.buttons.prev}
            />
            <FlatButton
                label="Назад"
                disabled={stepIndex === 0}
                onTouchTap={handlePrev}
                style={styles.buttons.prev}
            />
            <RaisedButton
                className={ finished ? 'hidden' : ''}
                label={stepIndex === (limit - 1) ? 'Финиш' : 'Далее'}
                primary={true}
                onTouchTap={handleNext}
            />
        </div>
    );
};