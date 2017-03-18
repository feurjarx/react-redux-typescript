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
        fields: { }
    }
});

export default styles;