import * as React from "react";
import * as Redux from "redux";
import {connect} from "react-redux";

import ComponentState = React.ComponentState;
import VisibilityFilter = Todo.VisibilityFilter;
import {Todo} from "../../typings/todo";

import {setVisibilityFilter} from "../actions/index";

export interface FooterProperties {
    visibilityFilter?: VisibilityFilter;
    dispatch?(action: Redux.Action)
}

function mapStateToProps(state: Todo.State, props: FooterProperties): FooterProperties {
    return {
        visibilityFilter: state.visibilityFilter
    }
}

@connect(mapStateToProps)
export class Footer extends React.Component<FooterProperties, ComponentState> {
    constructor() {
        super();
    }

    render() {

        const {visibilityFilter, dispatch} = this.props;

        return (
            <footer>
                <h1>Footer Application</h1>
                <div>
                    <button
                        disabled={ visibilityFilter === 'all'}
                        onClick={() => dispatch(setVisibilityFilter('all'))}
                    >
                        All
                    </button>

                    <button
                        disabled={ visibilityFilter === 'active' }
                        onClick={() => {
                            dispatch(setVisibilityFilter('active'))
                        }}
                    >
                        Active
                    </button>

                    <button
                        disabled={ visibilityFilter === 'completed'}
                        onClick={() => dispatch(setVisibilityFilter('completed'))}
                    >
                        Completed
                    </button>
                </div>
            </footer>
        )
    }
}
