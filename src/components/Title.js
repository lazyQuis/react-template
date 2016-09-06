import React, { PropTypes, Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as sysAction from 'actions/sys'
import * as processingAction from 'actions/processing'
import * as getIPAction from 'actions/getIP'
import multiAction from 'actions/multiAction'
import { BaseComponent } from 'react-libs'
import config from 'constants/config'
import Crumbs from './Crumbs'

export class Title extends BaseComponent {
  constructor(props) {
    super()
    this.click = this.click.bind(this)
    this.sendMultiAction = this.sendMultiAction.bind(this)
    this.state = {
      msg: ''
    }
  }

  componentDidMount() {
    this.props.trace(this.props.text)
  }

  componentDidUpdate(prevProps, prevState) {
    this.props.trace(this.props.text)
  }

  click() {
    if(this.props.router) this.props.router.push(this.props.jump.replace(':value', Date.now()))
  }

  sendMultiAction(){
    this.props.multiAction({
      // id: 'stage-multi',
      actions: [
        () => { console.info('循環開始'); this.setState({ msg:'循環開始' }) },
        processingAction.processingStart(),

        sysAction.delay(1000),
        sysAction.trace('trace 1'),
        () => { console.info('trace 1'); this.setState({ msg:'trace 1' }) },

        sysAction.delay(1000),
        sysAction.trace('trace 2'),
        () => { console.info('trace 2'); this.setState({ msg:'trace 2' }) },

        sysAction.delay(1000),
        sysAction.trace('trace 3'),
        () => { console.info('trace 3'); this.setState({ msg:'trace 3' }) },

        sysAction.delay(1000),
        sysAction.trace('trace 4'),
        () => { console.info('trace 4'); this.setState({ msg:'trace 4' }) },

        sysAction.delay(1000),
        processingAction.processingEnd(),
        () => { console.info('循環結束'); this.setState({ msg:'循環結束' }) },

        getIPAction.getIP({ callback: (response) => {
          console.info('IP:', response.ip)
          this.setState({ msg:`IP: ${response.ip}` })
        }})
      ]
    })
  }

  render() {
    const { text, jump } = this.props


    return (
      <div className="scene__title">
        {config.mode}<br/>
        { this.props.router ? <Crumbs /> : null }
        { jump ? <button onClick={this.click} className="scene__button">Next Page</button> : null }

        <button onClick={this.sendMultiAction} className="scene__button">MultiAction API</button>
        <div className="scene__msg">{ this.state.msg }</div>
      </div>
    )
  }
}

Title.propTypes = {
  jump  : PropTypes.string,
  router: PropTypes.object,
  text  : PropTypes.string
}

Title.defaultProps = {
  jump   : '',
  text   : ''
}

export default connect(
    state => ({

    }),
    dispatch => bindActionCreators({
      ...sysAction, ...processingAction, multiAction
    }, dispatch)
)(Title)
