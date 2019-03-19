import React from 'react';
import PropTypes, { func } from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import SettingTab from './configSetting';
import SourceTab from './configSource';

const styles = {
    root: {
        flexGrow: 1,
    },
};

const TabContainer = (props) => {
    return <div style={{
        margin: '0 auto',
        maxWidth: 700
    }}>
        {props.children}
    </div>
}

class CenteredTabs extends React.Component {
    state = {
        value: 0,
    };

    handleChange = (event, value) => {
        this.setState({ value });
    };

    render() {
        const { classes } = this.props;

        const { value } = this.state;
        return (
            <div className={classes.root}>
                <Tabs
                    value={this.state.value}
                    onChange={this.handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                >
                    <Tab label="信息源" />
                    <Tab label="设置" />
                </Tabs>

                <div>
                    {value === 0 && <SourceTab />}
                    {value === 1 && <TabContainer>
                        {/* <SettingTab /> */}
                        开发中
                    </TabContainer>}
                </div>
            </div>
        );
    }
}

CenteredTabs.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CenteredTabs);
