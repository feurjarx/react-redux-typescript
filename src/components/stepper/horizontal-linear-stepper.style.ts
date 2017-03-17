import reactCSS from 'reactcss';
import CSSProperties = React.CSSProperties;

const styles = reactCSS({
    default: {
        main: {
            width: '100%',
            // maxWidth: 700,
            // margin: 'auto'
        },
        contentStyle: {
            margin: '0 16px'
        },
        buttons: {
            prev: {
                marginRight: 12
            },
            next: {

            }
        }
    }
});

export default styles;