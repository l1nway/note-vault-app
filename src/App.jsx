import './App.css'

import {CSSTransition, TransitionGroup} from 'react-transition-group'
import {createRef, useRef, useEffect, useMemo} from 'react'
import {Routes, Route, useLocation, Navigate} from 'react-router'
import Cookies from 'js-cookie'

import Navigation from './navigation'
import Login from './login'
import Landing from './landing'

import {apiStore, appStore} from './store'
import useOfflineSync from './components/useOfflineSync'

function App() {
  const online = apiStore(state => state.online)
  const setOfflineMode = appStore(state => state.setOfflineMode)

  const token = useMemo(() => [localStorage.getItem('token'), Cookies.get('token')].find(t => t && t !== 'null'), [])
  useOfflineSync(token)

  useEffect(() => {setOfflineMode?.(!online)}, [online, setOfflineMode])

  // 
  const location = useLocation()
  
  const nodeRefs = useRef({})

  const locationKey = location.pathname

  if (!nodeRefs.current[locationKey]) {
      nodeRefs.current[locationKey] = createRef()
  }

  const nodeRef = useMemo(() => {
    if (!nodeRefs.current[location.pathname]) {
      nodeRefs.current[location.pathname] = createRef()
    }
    return nodeRefs.current[location.pathname]
  }, [location.pathname])
  
  const topLevel = useMemo(() => (
    ['/login', '/register'].includes(location.pathname) ? location.pathname : 'main'
  ), [location.pathname])
  
  return (
    <div className='app-main'>
      <TransitionGroup component={null}>
        <CSSTransition
            classNames='nav-change'
            nodeRef={nodeRef}
            key={topLevel}
            timeout={300}
        >
          <div
            className='page-list'
            ref={nodeRef}
          >
            <Routes
              location={location}
            >
              <Route path='/register' element={<Login/>}/>
              <Route path='/*' element={<Navigation/>}/>
              <Route path='/login' element={<Login/>}/>
              <Route path='/' element={token ? <Navigate to='/notes' replace/> : <Landing/>}/>
            </Routes>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  )
}

export default App