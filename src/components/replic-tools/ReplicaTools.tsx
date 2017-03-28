import * as React from "react";
import "./replica-tools.css";
import StatelessComponent = React.StatelessComponent;

const ReplicaTools: StatelessComponent<any> = (props) => {

    const {
        addable,
        children,
        removeable,
        onReplicaAdd,
        onReplicaRemove
    } = props;

    const actions = [];
    if (removeable) {
        actions.push(
            <button key={actions.length} className="btn btn-danger btn-xs" onClick={ onReplicaRemove }>
                <i className="fa fa-remove"></i>
            </button>
        )
    }

    if (addable) {
        actions.push(
            <button key={actions.length} className="btn btn-success btn-xs" onClick={onReplicaAdd}>
                <i className="fa fa-plus"></i>
            </button>
        )
    }

    const actionsClassName = actions.length === 1 ? 'flex-end' : 'space-between';

    return (
        <div className="flex-row replica-wrap">
            <div>
                {children}
            </div>
            <div className={`flex-column replica-tools ${actionsClassName}`}>
                {actions}
            </div>
        </div>
    );
};

ReplicaTools.defaultProps = {
    addable: true,
    removeable: true
};

export default ReplicaTools;