import {useEffect, useState, useRef, createRef, useMemo, useCallback} from 'react'
import {Link, useLocation, Route, Routes, useNavigate, Navigate} from 'react-router'
import {useTranslation} from 'react-i18next'
import {CSSTransition, TransitionGroup} from 'react-transition-group'
import {motion, AnimatePresence} from 'framer-motion'
import Cookies from 'js-cookie'
import Privacy from './privacy'

import './navigation.css'
import './App.css'

import {NotebookPen, FolderOpen, Tag, Archive, Trash2, NotebookText, LogOut, UserPen, Cookie, MoveLeft, Notebook} from 'lucide-react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faUser as faUserSolid} from '@fortawesome/free-solid-svg-icons'
import Dropdown from './dropdown'

import {appStore, profileStore, notesViewStore, screenStore, clarifyStore, pendingStore, editorStore, settingStore, tokenStore} from './store'

import Profile from './profile/profile'
import Notes from './notes/notes'
    import NewNote from './notes/newNote'
    import Note from './notes/note'
import Groups from './groups/groups'
import Trash from './trash/trash'

function Navigation() {

    const {t} = useTranslation()
    const location = useLocation()
    const navigate = useNavigate()
    
    const guestMode = appStore(state => state.guestMode)

    // universal function for convenient routing of all values ​​from local storage and cookies
    const storedValue = useCallback((element) => {
        return [
            localStorage.getItem(element),
            Cookies.get(element)
                ].find(
                    val => val && val !== 'null'
                ) || ''
    }, [])

    const auth = {
        // individual token of the logged-in user
        token: storedValue('token'),
        name: storedValue('name'),
        email: storedValue('email'),
        avatar: storedValue('avatar'),
    }

    // object with the number of objects at each endpoint
    const [amount, setAmount] = useState([])

    // 
    const [ghost, setGhost] = useState({
        active: false,
        style: {},
        className: ''
    })

    const ghostRefs = useRef(new Map())

    const navLinksWrapper = useRef(null)

    const [nowLink, setNowLink] = useState(location.pathname)

    const handleGhostMove = useCallback(async (targetLink) => {
        
        if (targetLink == nowLink) return

        const sourceEl = ghostRefs.current.get(nowLink)
        const targetEl = ghostRefs.current.get(targetLink)
        const container = navLinksWrapper.current

        if (!sourceEl || !targetEl || !container) {
            setNowLink(targetLink)
            return
        }

        const containerRect = container.getBoundingClientRect()
        const sourceRect = sourceEl.getBoundingClientRect()
        const targetRect = targetEl.getBoundingClientRect()

        const start = {
            top: sourceRect.top - containerRect.top,
            left: sourceRect.left - containerRect.left,
            width: sourceRect.width,
            height: sourceRect.height
        }

        const end = {
            top: targetRect.top - containerRect.top,
            left: targetRect.left - containerRect.left,
            width: targetRect.width,
            height: targetRect.height
        }

        setGhost({
            active: true,
            style: start,
            className: 'ghost-element'
        })

        await nextFrame()
        await nextFrame()

        setGhost({
            active: true,
            style: end,
            className: 'ghost-element animate'
        })

        await wait(300)

        setNowLink(targetLink)

        setGhost({
            active: false,
            style: end,
            className: ''
        })
    }, [nowLink])

    const nodeRefs = useRef({})

    const navRef = useRef(null)

    const locationKey = location.pathname

    if (!nodeRefs.current[locationKey]) {
        nodeRefs.current[locationKey] = createRef()
    }

    const nodeRef = nodeRefs.current[locationKey]
    
    useEffect(() => {
        setNowLink(location.pathname)
    }, [location])

    const navlinks = useMemo(() => [
        {
            title: 'All notes',
            link: '/notes',
            icon: 
                <Notebook 
                    className='nav-icon'
                    style={{color: '#f7e983'}}
                />
        },{
            title: 'categories',
            link: '/categories',
            icon: <FolderOpen 
                className='nav-icon'
                style={{color: '#f7e983'}}
            />
        },{
            title: 'tags',
            link: '/tags',
            icon: <Tag style={{color: 'azure'}} className='nav-icon'/>
        },{
            title: 'archive',
            link: '/archived',
            icon: <Archive style={{color: '#ffdaaa'}} className='nav-icon'/>
        },{
            title: 'trash',
            link: '/trash',
            icon: <Trash2 style={{color: '#e5010b'}} className='nav-icon'/>
        }
    ], [])

    const redirect = useCallback((link, e) => {
        if (nowLink == link) {
            e.preventDefault()
            return
        }
        handleGhostMove(link)
        setMenu(false)
    }, [nowLink, handleGhostMove])

    const renderLinks = useMemo(() => 
        navlinks.map((element, index) =>
            <Link
                to={element.link}
                key={index}
                ref={(el) => {
                    if (el) ghostRefs.current.set(element.link, el)
                    else ghostRefs.current.delete(element.link)
                }}
                className='nav-link'
                onClick={(e) => redirect(element.link, e)}
            >
                <label
                    className='link-label'
                >
                    <div
                        className='nav-title'
                    >
                        {element.icon}
                        <div
                            className='nav-text'
                        >
                            {t(element.title)}
                        </div>
                    </div>

                    {amount[index] > 0 && (
                        <div
                            className='nav-amount'
                        >
                            {amount[index]}
                        </div>
                    )}

                    <input
                        id={`link-${index}`}
                        type='radio'
                        name='navlink'
                        checked={nowLink == element.link}
                        readOnly
                    />
                </label>
            </Link>
        ), [navlinks, nowLink, amount, t, handleGhostMove]
    )

    const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve))

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    //

    const [menu, setMenu] = useState(false)

    const stores = [appStore, profileStore, notesViewStore, screenStore, clarifyStore, pendingStore, editorStore, settingStore, tokenStore]

    const logout = useCallback(() => {
        const keys = ['token', 'name', 'email', 'verif', 'accdate', 'avatar', 'remember']
        keys.forEach(k => localStorage.removeItem(k))
        keys.forEach(k => Cookies.remove(k))

        stores.forEach(store => {
            store.setState({}, true)
        })

        window.location.href = '/login'
    }, [])

    const mobile = {
        '/profile': {
            label: 'Profile',
            icon: <UserPen style={{color: 'azure'}} className='nav-icon' />
        },
        '/privacy': {
            label: 'Privacy',
            icon: <Cookie style={{color: 'azure'}} className='nav-icon' />
        },
        '/notes/new': {
            label: 'New note',
            icon: <NotebookPen style={{color: 'rgb(247, 233, 131)'}} className='nav-icon'/>
        },
        '/notes/edit': {
            label: 'Edit note',
            icon: <NotebookPen style={{color: 'rgb(247, 233, 131)'}} className='nav-icon'/>
        },
        '/notes/note':{
            label: 'Note',
            icon: <Notebook style={{color: 'rgb(247, 233, 131)'}} className='nav-icon'/>
        }
    }

    const currentTitle = useMemo(
        () => navlinks.find(l => location.pathname.startsWith(l.link))?.title,
        [navlinks, location.pathname]
    )

    const currentNav = useMemo(
        () => navlinks.find(l => location.pathname.startsWith(l.link)),
        [navlinks, location.pathname]
    )
    
    const dropdownRef = useRef(null)

    return(
        <>
            <div
                className='nav-main'
            >
                        <div
                            className='nav-logo'
                        >
                            <NotebookText className='logo-pic'/>
                            <div className='nav-main-title'>
                                Note Vault
                            </div>
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    className='nav-mobile-title'
                                    initial={{y: 10, opacity: 0}}
                                    animate={{y: 0, opacity: 1}}
                                    transition={{duration: 0.2}}
                                    exit={{y: -10, opacity: 0}}
                                    key={location.pathname} 
                                >
                                    {Object.entries(mobile).find(([key]) => location.pathname.startsWith(key)) 
                                        ? (() => {
                                            const item = Object.entries(mobile).find(([key]) => location.pathname.startsWith(key))[1]
                                            return <>{item.icon}{item.label}</>
                                        })()
                                        : <>{currentNav?.icon}{t(currentTitle)}</>}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                            <div
                                className={`nav-group nav-arrowwww ${
                                    location.pathname !== '/notes/new' &&
                                    location.pathname !== '/profile' &&
                                    !location.pathname.startsWith('/notes/edit') &&
                                    !location.pathname.startsWith('/notes/note') ? 'nav-group-mobile' : ''
                                }`}
                                style={{color: 'var(--def-white)'}}
                                onClick={() => navigate(-1)}
                            >
                                <MoveLeft className='nav-icon'/>
                            </div>
                            <div
                                className={`nav-group ${
                                    location.pathname === '/notes/new' ||
                                    location.pathname === '/profile' ||
                                    location.pathname.startsWith('/notes/edit') ||
                                    location.pathname.startsWith('/notes/note') ? 'nav-group-mobile' : ''
                                }`}
                                onClick={() => setMenu(!menu)}
                                ref={navRef}
                                tabIndex='1'
                            >
                                <div
                                    className={`hamburger-icon ${menu ? 'open' : ''}`}
                                >
                                    <span/>
                                    <span/>
                                    <span/>
                                    <span/>
                                </div>

                                <Dropdown
                                    className='nav-dropdown'
                                    toggle={() => setMenu(!menu)}
                                    visibility={menu}
                                    ref={dropdownRef}
                                >
                                    {renderLinks}
                                </Dropdown>

                                <div
                                    className='nav-links'
                                    ref={navLinksWrapper}
                                >
                                    {renderLinks}
                                    {ghost.active && (
                                        <div
                                            className={ghost.className}
                                            style={ghost.style}
                                        />
                                    )}
                                </div>
                            </div>
                        
                    <Link to='../privacy' className='nav-privacy-link'>
                        Privacy Policy
                    </Link>
                    <div
                        className='nav-profile'
                        onClick={() => setMenu(false)}
                    >
                        <Link
                            className='profile-text'
                            to={auth.token ? '/profile' : '/login'}
                            tabIndex='0'
                        >
                            {auth.token ?
                                <img
                                    className='profile-img'
                                    src={`${auth.avatar}?t=${Date.now()}`}
                                />
                            :
                                <FontAwesomeIcon
                                    className='profile-icon'
                                    icon={faUserSolid}
                                />
                            }
                            <div
                                className='profile-info'
                            >
                                {!auth.token ?
                                    <div
                                        className='not-authorized'
                                    >
                                        {t('not logged in')}
                                    </div>
                                    :
                                    <>
                                        <p
                                            className='navbar-name'
                                        >
                                            {auth.name}
                                        </p>
                                        <p
                                            className='navbar-email'
                                        >
                                            {auth.email?.replace(/^[^@]+/, '…')}
                                        </p>
                                    </>
                                }
                            </div>
                        </Link>
                        {/* logout button present only if the user is logged in*/}
                        {auth.token
                            ? 
                                <LogOut
                                    className='logout-icon'
                                    onClick={() => logout()}
                                />
                            :
                                null
                        }
                    </div>
            </div>
            {/*  */}
            <div
                className='content-wrapper'
            >
                <TransitionGroup
                    component={null}
                >
                    <CSSTransition
                        key={location.pathname}
                        nodeRef={nodeRef}
                        classNames='nav-change'
                        timeout={300}
                    >
                        <div
                            ref={nodeRef}
                            className='nav-routing'
                        >
                            <Routes
                                location={location}
                            >
                                <Route path='*' element={<Navigate to='/notes' replace/>}/>
                                <Route 
                                    path='profile'
                                    element={auth.token || guestMode ? <Profile/> : <Navigate to='/login' replace />} 
                                />
                                <Route path='notes' element={<Notes/>}/>
                                    <Route path='notes/new' element={<NewNote/>}/>
                                    <Route path='notes/edit/:id' element={<NewNote/>}/>
                                    <Route path='notes/note/:id' element={<Note/>}/>
                                <Route path='categories' element={<Groups/>}/>
                                <Route path='tags' element={<Groups/>}/>
                                <Route path='archived' element={<Trash/>}/>
                                <Route path='trash' element={<Trash/>}/>
                                <Route path='privacy' element={<Privacy/>}/>
                            </Routes>
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </div>
        </>
    )
}

export default Navigation
