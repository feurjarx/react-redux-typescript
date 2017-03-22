import reactCSS from 'reactcss';
import CSSProperties = React.CSSProperties;

const styles = reactCSS({
    default: {
        tables: {
            replica: { },
            replicator: {
                display: 'flex',
                justifyContent: 'center'
            }
        },
        fields: {
            textField: {
                width: 150
            },
            autocompleteField: {
                width: 150,
                overflow: 'hidden'
            }
        }
    }
});

export default styles;