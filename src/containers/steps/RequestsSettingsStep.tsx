import * as React from "react";
import lifeConfig from "../../configs/life";

const syntaxConfig = require('../../configs/syntax.json');
import InfoSlider from '../../components/info-slider/InfoSlider';
import TextField from 'material-ui/TextField'
import FormDataService from "../../services/FormData";

export class RequestsSettingsStep extends React.Component<any, any> {

    fds: FormDataService;

    state = {
        nClients: lifeConfig.nClients,
        nServers: lifeConfig.nServers,
        requestsLimit: lifeConfig.requestsLimit,
        requestTimeLimit: lifeConfig.requestTimeLimit
    };

    constructor(props) {
        super();

        const {formDataService} = props;
        formDataService.setData(Object.assign({}, this.state));
        this.fds = formDataService;
    }

    handleFormChange = (event) => {
        const { target } = event;

        this.setState({
            [target.name]: target.value
        }, () => {
            this.fds.setDataByPath(target.name, target.value);
        });
    };

    handleSlidersChange = (v: number, name: string) => {
        this.setState({
            [name]: v
        }, () => {
            this.fds.setDataByPath(name, v);
        });
    };


    render() {

        const {
            handleFormChange,
            handleSlidersChange
        } = this;

        const {
            nClients,
            requestsLimit,
            requestTimeLimit,
        } = this.props;

        return (

            <form onChange={ handleFormChange } id="life-data-form">
                <div id="clients-settings-block" className="v-internal-interval-10">

                    <InfoSlider
                        name="nClients"
                        syntax={syntaxConfig['client']}
                        min={1}
                        defaultValue={ nClients }
                        onChange={ handleSlidersChange }
                    />

                    <InfoSlider
                        label="Лимит клиента"
                        name="requestsLimit"
                        syntax={syntaxConfig['request']}
                        min={1}
                        defaultValue={ requestsLimit }
                        onChange={ handleSlidersChange }
                    />

                    <InfoSlider
                        label="Лимит сложности запроса"
                        name="requestTimeLimit"
                        shortSyntax=""
                        min={1}
                        max={10000}
                        defaultValue={ requestTimeLimit }
                        onChange={ handleSlidersChange }
                    />
                </div>

                <div id="servers-settings-block">

                    <TextField
                        multiLine={true}
                        floatingLabelText="SQL-запросы:"
                        rows={2}
                        defaultValue={
                        `
                        SELECT * FROM user AS u WHERE u.id > 1000
                        <br>
                        SELECT * FROM phone AS p WHERE p.tel like %+7%
                        `
                    }
                    />

                    {/*<InfoSlider
                     name="nServers"
                     syntax={syntaxConfig['server']}
                     min={1}
                     max={10}
                     defaultValue={ nServers }
                     onChange={ handleSlidersChange }
                     />*/}

                </div>
            </form>
        )
    }
}
export default RequestsSettingsStep;