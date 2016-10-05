import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { } from '../../redux/modules/pse'

import { logoutAndRedirect } from 'redux/modules/auth'

import HomeHeader from 'components/Header/headerComponent'
import PSETab from 'components/Tabcontents/pseTab'
import ClientsTab from 'components/Tabcontents/clientsTab'
import DashboardTab from 'components/Tabcontents/dashboardTab'
import ProjectsTab from 'components/Tabcontents/projectsTab'
import GeotechsTab from 'components/Tabcontents/geotechsTab'

import $ from 'jquery'
window.jQuery = $

import menuAim from 'jquery-menu-aim'

export class HomePageView extends React.Component {
  static propTypes = {
    page: PropTypes.string,
    logoutAndRedirect: PropTypes.func
  };

  constructor () {
    super()
    this.state = {
      'tab': 'Dashboard tab',
      'content': <DashboardTab />
    }
  }

  componentDidMount () {

    const mainContent = $('.cd-main-content')
    const header = $('.cd-main-header')
    const sidebar = $('.cd-side-nav')
    const sidebarTrigger = $('.cd-nav-trigger')
    const topNavigation = $('.cd-top-nav')
    const searchForm = $('.cd-search')
    const accountInfo = $('.account')

    let resizing = false
    let scrolling = false

    moveNavigation()
    checkScrollbarPosition()
    $(window).on('resize', function () {
      if (!resizing) {
        (!window.requestAnimationFrame) ? setTimeout(moveNavigation, 300) : window.requestAnimationFrame(moveNavigation)
        resizing = true
      }
    })

    $(window).on('scroll', function () {
      if (!scrolling) {
        (!window.requestAnimationFrame) ? setTimeout(checkScrollbarPosition, 300) : window.requestAnimationFrame(checkScrollbarPosition)
        scrolling = true
      }
    })

// mobile only - open sidebar when user clicks the hamburger menu
    sidebarTrigger.on('click', function (event) {
      event.preventDefault()
      $([sidebar, sidebarTrigger]).toggleClass('nav-is-visible')
    })

// click on item and show submenu
    $('.has-children > a').on('click', function (event) {
      const mq = checkMQ()
      const selectedItem = $(this)
      if (mq === 'mobile' || mq === 'tablet') {
        event.preventDefault()
        if (selectedItem.parent('li').hasClass('selected')) {
          selectedItem.parent('li').removeClass('selected')
        } else {
          sidebar.find('.has-children.selected').removeClass('selected')
          accountInfo.removeClass('selected')
          selectedItem.parent('li').addClass('selected')
        }
      }
    })

// Click on account and show submenu - desktop version only
    accountInfo.children('a').on('click', function (event) {
      const mq = checkMQ()
      if (mq === 'desktop') {
        event.preventDefault()
        accountInfo.toggleClass('selected')
        sidebar.find('.has-children.selected').removeClass('selected')
      }
    })

    $(document).on('click', function (event) {
      if (!$(event.target).is('.has-children a')) {
        sidebar.find('.has-children.selected').removeClass('selected')
        accountInfo.removeClass('selected')
      }
    })

    function checkMQ () {
      // check if mobile or desktop device
      if (window) {
        return window.getComputedStyle(document.querySelector('.cd-main-content'), '::before').getPropertyValue('content').replace(/'/g, '').replace(/"/g, '')
      } else {
        return
      }

    }

    function moveNavigation () {
      const mq = checkMQ()

      if (mq === 'mobile' && topNavigation.parents('.cd-side-nav').length === 0) {
        detachElements()
        topNavigation.appendTo(sidebar)
        searchForm.removeClass('is-hidden').prependTo(sidebar)
      } else if ((mq === 'tablet' || mq === 'desktop') && topNavigation.parents('.cd-side-nav').length > 0) {
        detachElements()
        searchForm.insertAfter(header.find('.cd-logo'))
        topNavigation.appendTo(header.find('.cd-nav'))
      }
      checkSelected(mq)
      resizing = false
    }

    function detachElements () {
      topNavigation.detach()
      searchForm.detach()
    }

    function checkSelected (mq) {
      // on desktop, remove selected class from items selected on mobile/tablet version
      if (mq === 'desktop') $('.has-children.selected').removeClass('selected')
    }

    function checkScrollbarPosition () {
      var mq = checkMQ()

      if (mq !== 'mobile') {
        var sidebarHeight = sidebar.outerHeight(),
          windowHeight = $(window).height(),
          mainContentHeight = mainContent.outerHeight(),
          scrollTop = $(window).scrollTop()

        if ((scrollTop + windowHeight > sidebarHeight) && (mainContentHeight - sidebarHeight !== 0)) {
          sidebar.addClass('is-fixed').css('bottom', 0)
        }

      }
      scrolling = false
    }

  }

  handleLogOut () {
    this.props.logoutAndRedirect()
  }

  handleDashboardTabClick (e) {
    this.setState({
      tab: 'Dashboard tab',
      content: <DashboardTab />
    })
  }
  handleClientsTabClick (e) {
    this.setState({
      tab: 'Clients tab',
      content: <ClientsTab />
    })
  }
  handleProjectsTabClick (e) {
    this.setState({
      tab: 'Projects tab',
      content: <ProjectsTab />
    })
  }
  handleGeotechsTabClick (e) {
    this.setState({
      tab: 'Geotechs tab',
      content: <GeotechsTab />
    })
  }
  handleMyPSETabClick (e) {
    this.setState({
      tab: 'My PSE tab',
      content: <PSETab />
    })
  }

  render () {
    return (
      <div>
        <HomeHeader logout={::this.handleLogOut} />
        <main className='cd-main-content'>
          <nav className='cd-side-nav'>
            <ul>
              <li className={this.state.tab === 'Dashboard tab' ? 'has-children overview active' : 'has-children overview'}>
                <a href='#0' onClick={::this.handleDashboardTabClick}>Dashboard</a>
              </li>
              <li className={this.state.tab === 'Clients tab' ? 'has-children users active' : 'has-children users'}>
                <a href='#0' onClick={::this.handleClientsTabClick}>Clients</a>
              </li>
              <li className={this.state.tab === 'Projects tab' ? 'has-children comments active' : 'has-children comments'}>
                <a href='#0' onClick={::this.handleProjectsTabClick}>Projects</a>
              </li>
              <li className={this.state.tab === 'Geotechs tab' ? 'has-children comments active' : 'has-children comments'}>
                <a href='#0' onClick={::this.handleGeotechsTabClick}>Geotechs</a>
              </li>
              <li className={this.state.tab === 'My PSE tab' ? 'has-children overview  active' : 'has-children users'}>
                <a href='#0' onClick={::this.handleMyPSETabClick}>My PSE</a>
              </li>
            </ul>
          </nav>

          <div className='content-wrapper'>
            {this.state.content}
          </div>
        </main>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
})

export default connect((mapStateToProps), {
  logoutAndRedirect
})(HomePageView)
