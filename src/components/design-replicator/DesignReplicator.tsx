import * as React from "react";
import * as ReactDOM from "react-dom";
import './design-replicator.css';

export class DesignReplicator extends React.Component<any, any> {

    static defaultProps = {
        styles: {
            replica: {}
        },
        onReplicaAdd: null,
        onReplicaRemove: null,
        onBeforeReplicaAdd: null
    };

    constructor(props) {
        super();

        const { onReplicaAdd, onReplicaRemove } = this;
        const listeners = { onReplicaAdd, onReplicaRemove };

        this.state = {
            replics: [
                <DesignReplica
                    replicaStyle={props.styles.replica}
                    key={0}
                    body={ props.children }
                    suffix={ generateRandomString(10) }
                    {...listeners}
                />
            ]
        }
    }

    onReplicaAdd = event => {
        event.preventDefault();

        const { replics } = this.state;

        const currentPos = replics.length - 1;
        const nextPos = currentPos + 1;

        const replica = React.cloneElement(replics[currentPos], {
            key: nextPos
        });

        replics.push(replica);
        this.setState({ replics }, () => {
            if (this.props.onReplicaAdd instanceof Function) {

                const suffix = replica.props['suffix'];

                const replicatorBox = ReactDOM.findDOMNode(this);

                const currentReplicaBox = replicatorBox
                    .querySelectorAll('.design-replica-' + suffix)[currentPos];

                const nextReplicaBox = replicatorBox
                    .querySelectorAll('.design-replica-' + suffix)[nextPos];

                const currentNamesElems = currentReplicaBox.querySelectorAll('[name]');
                const nextNamesElems = nextReplicaBox.querySelectorAll('[name]');

                for (let i = 0; i < currentNamesElems.length; i++) {
                    const name = currentNamesElems.item(i).getAttribute('name');
                    nextNamesElems.item(i).setAttribute('name', name);
                }

                this.props.onReplicaAdd(nextPos, nextReplicaBox);
            }
        });
    };

    onReplicaRemove = event => {
        event.preventDefault();

        const { replics } = this.state;
        replics.pop();

        this.setState({ replics });

        if (this.props.onReplicaRemove instanceof Function) {
            this.props.onReplicaRemove(replics.length - 1);
        }
    };

    render() {

        const { styles, id } = this.props;
        const { replics } = this.state;

        return (
            <div className="design-replicator" style={styles.replicator}>
                { replics }
            </div>
        )
    }
}


class DesignReplica extends React.Component<any, any> {

    constructor() {
        super();
    }

    render() {

        const {
            onReplicaRemove,
            onReplicaAdd,
            replicaStyle,
            suffix,
            body
        } = this.props;

        return (
            <div
                className={`design-replica design-replica-${suffix}`}
                style={replicaStyle}
            >
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
        )
    }
}

function generateRandomString(length = 10) {
    return Math.random().toString(36).substr(2, 2 + length);
}