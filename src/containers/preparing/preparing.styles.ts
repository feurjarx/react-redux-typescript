import reactCSS from 'reactcss';
import CSSProperties = React.CSSProperties;

const styles = reactCSS({
    default: {
        dialog: {
            content: {
                // width: 'calc(100% / 2)',
                width: '100%',
                maxWidth: 'none'
            },
            body: {
                // display: 'flex',
                // justifyContent: 'center',
                // alignItems: 'center',
                // flexDirection: 'column'
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