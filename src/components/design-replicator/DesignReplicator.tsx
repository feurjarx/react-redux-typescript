import * as React from "react";
import './design-replicator.css';

export class DesignReplicator extends React.Component<any, any> {

    constructor(props) {
        super();

        const { onReplicaAdd, onReplicaRemove } = this;
        const listeners = { onReplicaAdd, onReplicaRemove };

        this.state = {
            replics: [
                <DesignReplica
                    key={0}
                    body={ props.children }
                    {...listeners}
                />
            ]
        }
    }

    onReplicaAdd = event => {
        event.preventDefault();

        const { replics } = this.state;

        const currentPos = replics.length - 1;

        const replica = React.cloneElement(replics[0], {
            key: currentPos + 1,
        });

        replics.push(replica);
        this.setState({ replics })
    };

    onReplicaRemove = event => {
        event.preventDefault();

        const { replics } = this.state;
        replics.pop();

        this.setState({ replics })
    };

    render() {

        const { replics } = this.state;

        return (
            <div className="design-replicator">
                { replics }
            </div>
        )
    }
}

const DesignReplica = (props) => {

    const {
        onReplicaRemove,
        onReplicaAdd,
        body
    } = props;

    return <div className="design-replica">
        <div className="replica-content">

            <div className="replica-main">
                { body }
            </div>

            <div className="replica-actions">
                <button
                    className="btn btn-danger btn-xs replica-remove"
                    onClick={ onReplicaRemove }
                >
                    <i className="fa fa-remove"></i>
                </button>
                <button
                    className="btn btn-success btn-xs replica-add"
                    onClick={ onReplicaAdd }
                >
                    <i className="fa fa-plus"></i>
                </button>
            </div>
        </div>
    </div>
};