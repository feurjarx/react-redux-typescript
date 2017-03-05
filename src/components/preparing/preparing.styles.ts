import reactCSS from 'reactcss';
import CSSProperties = React.CSSProperties;

const styles = reactCSS({
    default: {
        dialog: {
            content: {
                width: 'calc(100% / 2)'
            },
            body: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
            },
            title: {
                textAlign: 'center'
            }
        }
    }
});

export default styles;