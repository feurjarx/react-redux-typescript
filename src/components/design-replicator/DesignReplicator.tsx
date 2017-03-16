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
                    last={true}
                    first={true}
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

        const currentReplica = React.cloneElement(replics[currentPos], {
            last: false,
        });

        replics.pop();
        replics.push(currentReplica);

        const replica = React.cloneElement(replics[0], {
            key: currentPos + 1,
            first: false,
            last: true,
        });

        replics.push(replica);
        this.setState({ replics })
    };

    onReplicaRemove = event => {
        event.preventDefault();

        const { replics } = this.state;

        const currentPos = replics.length - 1;
        const prevPos = currentPos - 1;

        const prevReplica = React.cloneElement(replics[ currentPos - 1], {
            first: !prevPos,
            last: true,
        });

        replics.pop();
        replics.pop();
        replics.push(prevReplica);

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
        position,
        first,
        last,
        body
    } = props;

    return <div className="design-replica">
        <div className="replica-content">

            <div className="replica-main">
                { body }
            </div>

            <div className="replica-actions" style={{ display: last ? 'block' : 'none' }}>
                <button
                    className="btn btn-danger btn-xs replica-remove"
                    onClick={ onReplicaRemove }
                    style={{ display: first ? 'none' : 'block' }}
                >
                    <i className="fa fa-remove"></i>
                </button>
                <button
                    value={ position }
                    className="btn btn-success btn-xs replica-add"
                    onClick={ onReplicaAdd }
                >
                    <i className="fa fa-plus"></i>
                </button>
            </div>
        </div>
    </div>
};