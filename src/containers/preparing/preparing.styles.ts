import reactCSS from 'reactcss';
import CSSProperties = React.CSSProperties;

const styles = reactCSS({
    default: {
        dialog: {
            content: {
                width: '100%',
                maxWidth: 'none'
            },
            body: {
                overflowX: 'auto',
                overflowY: 'hidden'
            },
            title: {
                textAlign: 'center'
            }
        }
    }
});

export default styles;