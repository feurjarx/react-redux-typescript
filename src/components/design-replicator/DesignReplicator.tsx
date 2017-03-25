import * as React from "react";
import * as ReactDOM from "react-dom";
import './design-replicator.css';
import SyntheticEvent = React.SyntheticEvent;

export interface DesignReplicatorProps {
    id?: string;
    styles?: any;
    hint?: string;
    onReplicaAdd?(
        nextPos: number,
        hint: string,
        extra?: any
    );
    onReplicaRemove?(
        removedPos: number,
        hint: string,
        path: string
    );
}


export class DesignReplicator extends React.Component<DesignReplicatorProps, any> {

    static defaultProps = {
        styles: {
            replica: {}
        },
        hint: null,
        onReplicaAdd: null,
        onReplicaRemove: null
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

        const { hint } = this.props;
        const { replics } = this.state;

        const pos = replics.length - 1;
        const nextPos = pos + 1;

        const replica = React.cloneElement(replics[pos], {
            key: nextPos
        });

        replics.push(replica);
        this.setState({ replics }, () => {

            const suffix = replica.props['suffix'];
            const repSelector = '.design-replica-' + suffix;

            const replicatorBox = ReactDOM.findDOMNode(this);

            const replicaElem = replicatorBox.querySelectorAll(repSelector)[pos];
            const namableElems = replicaElem.querySelectorAll('[name]');

            const nextReplicaElem = replicatorBox.querySelectorAll(repSelector)[nextPos];
            const nextNamableElems = nextReplicaElem.querySelectorAll('[name]');

            for (let i = 0; i < nextNamableElems.length; i++) {
                const name = namableElems.item(i).getAttribute('name');
                nextNamableElems.item(i).setAttribute('name', name);
            }


            [].map.call(nextNamableElems, elem => {
                if (elem.name) {
                    elem.name = calcPathByIndex(elem.name, nextPos, hint);
                }
            });

            if (this.props.onReplicaAdd instanceof Function) {
                this.props.onReplicaAdd(nextPos, hint, {nextReplicaElem, replicaElem});
            }
        });
    };

    onReplicaRemove = event => {
        event.preventDefault();

        const {onReplicaRemove, hint } = this.props;
        const { replics } = this.state;

        const removedIndex = replics.length - 1;
        const removedReplica = replics.pop();

        const suffix = removedReplica.props['suffix'];
        const repSelector = '.design-replica-' + suffix;
        const replicatorBox = ReactDOM.findDOMNode(this);
        const removedReplicaElem = replicatorBox.querySelectorAll(repSelector)[removedIndex];
        const namableFirstElem = removedReplicaElem.querySelector('[name]:not([name=""])');

        this.setState({ replics }, () => {
            if (onReplicaRemove instanceof Function) {
                onReplicaRemove(removedIndex, hint, namableFirstElem.getAttribute('name'));
            }
        });
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

function calcPathByIndex(path, index, hint) {

    // const goal = hint.split('..').pop();

    const pathParts = path.split('.');
    pathParts.forEach((v, i) => {

        const prev = pathParts[i - 1];

        if (prev === hint && /^\d+$/.test(v)) {
            pathParts[i] = index;
            return false;
        }
    });

    return pathParts.join('.');
}