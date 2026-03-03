import {Link, useLocation, Route, Routes, useNavigate, Navigate} from 'react-router'
import {useEffect, useState, useRef, createRef, useMemo, useCallback} from 'react'
import {CSSTransition, TransitionGroup} from 'react-transition-group'
import {motion, AnimatePresence} from 'framer-motion'
import {useShallow} from 'zustand/react/shallow'
import {useTranslation} from 'react-i18next'
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

    const {name, setName, email, setEmail, avatar, setAvatar, setLanguage} = profileStore(
        useShallow((state) => ({
            setLanguage: state.setLanguage,
            setAvatar: state.setAvatar,
            setEmail: state.setEmail,
            setName: state.setName,
            avatar: state.avatar,
            email: state.email,
            name: state.name
        }))
    )

    // universal function for convenient routing of all values ​​from local storage and cookies
    const token = useMemo(() => {
        return [
            localStorage.getItem('token'),
            Cookies.get('token')
        ].find(t => t && t !== 'null')
    }, [])

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) return

            try {
                const response = await fetch(`https://note-vault-backend-w1uv.onrender.com/api/v1/users/me`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    setAvatar(data.avatar_url)
                    setLanguage(data.language)
                    setEmail(data.email)
                    setName(data.name)
                } else if (response.status === 401) {
                    logout()
                }
            } catch (e) {
                console.error(e)
            }
        }

        fetchUser()
    }, [])

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

    if (!nodeRefs.current[locationKey]) {nodeRefs.current[locationKey] = createRef()}

    const nodeRef = nodeRefs.current[locationKey]
    
    useEffect(() => {setNowLink(location.pathname)}, [location])

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
        stores.forEach(store => {store.setState({}, true)})

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
                        toggle={() => setMenu(!menu)}
                        className='nav-dropdown'
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
                <div
                    onClick={() => setMenu(false)}
                    className='nav-profile'
                >
                    <Link
                        to={token ? '/profile' : '/login'}
                        className='profile-text'
                        tabIndex='0'
                    >
                        {token && avatar && avatar !== 'null' ?
                            <img
                                src={`${avatar}?t=${Date.now()}`}
                                className='profile-img'
                                key={avatar}
                            />
                        :
                            <FontAwesomeIcon
                                className='profile-icon'
                                icon={faUserSolid}
                            />
                        }
                        <div className='profile-info'>
                            {!token ?
                                <div className='not-authorized'>
                                    {t('not logged in')}
                                </div>
                                :
                                <>
                                    <p className='navbar-name'>
                                        {name}
                                    </p>
                                    <p className='navbar-email'>
                                        {email?.replace(/^[^@]+/, '…')}
                                    </p>
                                </>
                            }
                        </div>
                    </Link>
                    {/* logout button present only if the user is logged in*/}
                    {token &&
                        <LogOut
                            className='logout-icon'
                            onClick={logout}
                        />
                    }
                </div>
                <Link to='../privacy' className='nav-privacy-link'>
                    Privacy Policy
                </Link>
            </div>
            {/*  */}
            <div className='content-wrapper'>
                <TransitionGroup component={null}>
                    <CSSTransition
                        key={location.pathname}
                        classNames='nav-change'
                        nodeRef={nodeRef}
                        timeout={300}
                    >
                        <div ref={nodeRef} className='nav-routing'>
                            <Routes location={location}>
                                <Route
                                    element={token ? <Navigate to='/notes' replace/> : <Navigate to='/' replace/>}
                                    path='*'
                                />
                                <Route
                                    element={token ? <Profile/> : <Navigate to='/login' replace />} 
                                    path='profile'
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
