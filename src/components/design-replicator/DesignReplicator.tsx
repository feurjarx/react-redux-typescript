import * as React from "react";
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
        this.setState({ replics }, () => {
            if (this.props.onReplicaAdd instanceof Function) {
                this.props.onReplicaAdd(currentPos + 1);
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

        const { styles } = this.props;
        const { replics } = this.state;

        return (
            <div className="design-replicator" style={styles.replicator}>
                { replics }
            </div>
        )
    }
}

const DesignReplica = (props) => {

    const {
        onReplicaRemove,
        onReplicaAdd,
        replicaStyle,
        body
    } = props;

    return (
        <div className="design-replica" style={replicaStyle}>
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
};