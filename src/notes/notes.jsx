import {useState, useEffect, useRef, useCallback, useMemo} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {Select} from 'react-animated-select'
import {useTranslation} from 'react-i18next'
import {Link} from 'react-router'

import Cookies from 'js-cookie'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlane, faSpinner, faTrashCan, faTriangleExclamation, faMagnifyingGlass as faMagnifyingGlassSolid, faUserSlash, faArrowUp as faArrowUpSolid, faTableCells as faTableCellsSolid, faList as faListSolid, faFloppyDisk} from '@fortawesome/free-solid-svg-icons'

import SlideLeft from '../components/slideLeft'
import Hotkey from '../components/hotkey'
import NotesList from './notesList'
import {Plus} from 'lucide-react'

import {apiStore, appStore, clarifyStore, notesViewStore} from '../store'

import './notes.css'

function Notes() {
    const {t} = useTranslation()
    const token = useMemo(() => [localStorage.getItem('token'), Cookies.get('token')].find(t => t && t !== 'null'), [])
    // 
    const online = apiStore(state => state.online)

    const {offlineMode, notes, tags, categories, setTags, setCategories} = appStore(
        useShallow(state => ({
            offlineMode: state.offlineMode,
            notes: state.notes,
            tags: state.tags,
            categories: state.categories,
            setTags: state.setTags,
            setCategories: state.setCategories
    })))

    const {notesError, setAction, setVisibility, animating, setAnimating, notesLoading, notesMessage, setClarifyLoading, retryFunction, setRetryFunction, tag, setTag, setCategory, category, search, setSearch} = clarifyStore(
        useShallow(state => ({
            notesError: state.notesError,
            setAction: state.setAction,
            setVisibility: state.setVisibility,
            animating: state.animating,
            setAnimating: state.setAnimating,
            notesLoading: state.notesLoading,
            notesMessage: state.notesMessage,
            setClarifyLoading: state.setClarifyLoading,
            retryFunction: state.retryFunction,
            setRetryFunction: state.setRetryFunction,
            tag: state.tag,
            setTag: state.setTag,
            category: state.category,
            setCategory: state.setCategory,
            search: state.search,
            setSearch: state.setSearch
    })))

    const {notesView, setNotesView} = notesViewStore(
        useShallow(state => ({
            notesView: state.notesView,
            setNotesView: state.setNotesView
    })))

    // refs for correctly setting focus on the checkbox imitation
    const gridRef = useRef(null)
    const listRef = useRef(null)
    // ref is used to prevent a bug where focus is set on first load
    const firstRender = useRef(true)
    const searchRef = useRef(null)
    const categoryRef = useRef(null)
    const tagRef = useRef(null)

    const [searchFocus, setSearchFocus] = useState(false)
    // selector open status
    const [categoryStatus, setCategoryStatus] = useState(false)
    const [tagStatus, setTagStatus] = useState(false)

    const focusSearch = useCallback(() => {
        searchRef.current?.focus()
    }, [])

    useEffect(() => {
        if (!token || !online) return
            const getTags = async () => {
                const res = await fetch(`https://api.notevault.pro/api/v1/tags`, {
                    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }
                })
                const data = await res.json()
                setTags?.(data)
            }

            const getCats = async () => {
                const res = await fetch(`https://api.notevault.pro/api/v1/categories`, {
                    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }
                })
                const data = await res.json()
                setCategories?.(data)
            }
        getTags()
        getCats()
    }, [token, online, setTags, setCategories])

    // array view monitored for changes, then the focus is set to the selected option
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false
            return
        }

        notesView == 'list' ? listRef.current?.focus() : gridRef.current?.focus()
    }, [notesView])

    //

    const openAnim = useCallback((action) => {
        if (animating == true) {
            return false
        }
        setAnimating(true)
        setAction(action)
        setRetryFunction(action)
        setClarifyLoading(true)

        setTimeout(() => {
            setVisibility(true)
        }, 10)

        setTimeout(() => {
            setAnimating(false)
        }, 300)
    }, [animating, setAnimating, setAction, setRetryFunction, setClarifyLoading, setVisibility])

    const hotkeys = useMemo(() => [{
        key: 'mod+k',
        trigger: focusSearch
    },{
        key: 'esc',
        trigger: () => searchRef.current?.blur(),
        enabled: searchFocus
    },{
        key: 'c',
        trigger: () => {
            setCategoryStatus(!categoryStatus)
            categoryRef.current?.focus()
        },
        enabled: !searchFocus
    },{
        key: 'alt+c, shift+c',
        trigger: () => {
            setCategoryStatus(!categoryStatus)
            categoryRef.current?.focus()
        }
    },{
        key: 't',
        trigger: () => {
            setTagStatus(!tagStatus)
            tagRef.current?.focus()
        },
        enabled: !searchFocus
    },{
        key: 'alt+t, shift+3, shift+t',
        trigger: () => {
            setTagStatus(!tagStatus)
            tagRef.current?.focus()
        }
    },{
        key: 'v',
        trigger: () => setNotesView(prev => (prev == 'list' ? 'grid' : 'list')),
        enabled: !searchFocus
    },{
        key: 'alt+v, shift+v',
        trigger: () => setNotesView(prev => (prev == 'list' ? 'grid' : 'list'))
    },{
        key: 'g',
        trigger: () => setNotesView('grid'),
        enabled: !searchFocus
    },{
        key: 'l',
        trigger: () => setNotesView('list'),
        enabled: !searchFocus
    },{
        key: 'alt+2',
        trigger: () => setNotesView('grid')
    },{
        key: 'alt+1',
        trigger: () => setNotesView('list')
    }], [focusSearch, searchFocus, setNotesView])

    const renderHotkeys = useMemo(() => 
        hotkeys.map((element, index) =>
            <Hotkey
                onTrigger={element.trigger}
                enabled={element.enabled}
                keys={element.key}
                key={element.key}
            />
        ), [hotkeys]
    )

    return(
        <div
            className='notes-main'
        >
            <article>
                <title>Notes — Note Vault</title>
            </article>
            <Link className='notes-new-mobile' to='new'>
                <Plus className='notes-new-mobile-button'/>
            </Link>
            <div
                className='notes-top'
            >
                <div
                    className='notes-top-group'
                >
                    <h1
                        className='notes-title'
                    >
                        {t('All notes')}
                    </h1>
                    {/* displayed during loading */}
                    <SlideLeft visibility={notesLoading}>
                        <FontAwesomeIcon
                            className='clarify-loading-icon'
                            icon={faSpinner}
                        />
                    </SlideLeft>
                    {/* displayed during saving */}
                    <SlideLeft visibility={notes?.some(item => item?.saving === true)}>
                        <FontAwesomeIcon
                            className={`loading-save-icon ${retryFunction == 'delete' ? '--trash' : null}`}
                            icon={retryFunction == 'delete' ? faTrashCan : faFloppyDisk}
                        />
                    </SlideLeft>
                    {/* displayed only if the server returned an error */}
                    <SlideLeft visibility={notesError || notes?.some(item => item?.error === true)}>
                        <FontAwesomeIcon
                            className='loading-error-icon'
                            icon={faTriangleExclamation}
                            onClick={() => openAnim(retryFunction)}
                        />
                    </SlideLeft>
                    {/*  */}
                    <SlideLeft visibility={false}>
                        <span
                            className='notes-error-text'
                        >
                            {t(notesMessage)}
                        </span>
                    </SlideLeft>
                    {/* displayed only if offline mode is enabled */}
                    <SlideLeft visibility={offlineMode}>
                        <FontAwesomeIcon
                            className='newnote-offline-icon'
                            icon={faPlane}
                        />
                    </SlideLeft>
                    {/* displayed only if the user is not authorized */}
                    <SlideLeft visibility={!token}>
                        <FontAwesomeIcon
                            className='unauthorized-user-icon'
                            icon={faUserSlash}
                        />
                    </SlideLeft>
                </div>
                <Link
                    to='new'
                    className={`notes-new ${(!online && !offlineMode) && '--new-disabled'}`}
                    onClick={(e) => (!online && !offlineMode) && e.preventDefault()}
                >
                    + {t('New note')}
                </Link>
            </div>
            {/* settings */}
            <div className='search-settings'>
                <label className={`input-group ${(notesError || (!search && !notes?.length)) && '--disabled'}`}>
                    <FontAwesomeIcon
                        style={{color: search ? '#fdc4e1' : '#F0EDF5'}}
                        icon={faMagnifyingGlassSolid}
                        className='search-icon'
                    />
                    <input
                        style={{cursor: notesError || (!search && !notes?.length) ? 'not-allowed' : 'text'}}
                        disabled={notesError || (!search && !notes?.length)}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t('Search in all notes…')}
                        onFocus={() => setSearchFocus(true)}
                        onBlur={() => setSearchFocus(false)}
                        tabIndex={notes?.length ? 0 : -1}
                        className='search-input'
                        ref={searchRef}
                        value={search}
                        type='text'
                    />
                        <div className='search-hotkeys'>
                            <SlideLeft visibility={!searchFocus}>
                                <kbd>⌘</kbd>+<kbd>K</kbd>
                            </SlideLeft>
                        </div>
                </label>
                <Select
                    tabIndex={categories?.length ? 0 : -1}
                    ArrowIcon={
                        <FontAwesomeIcon
                            className='select-icon'
                            icon={faArrowUpSolid}
                        />
                    }
                    loading={notesLoading && !categories?.length}
                    optionsClassName='notes-select-options'
                    className='notes-select'
                    offset={0}
                    options={categories}
                    disabled={!categories?.length}
                    error={notesError}
                    value={category?.id}
                    errorText={t('Error loading categories')}
                    disabledText={t('No categories')}
                    placeholder={t('All categories')}
                    emptyText={t('No categories')}
                    loadingText={t('Categories loading')}
                    onChange={setCategory}
                />
                <Select
                    tabIndex={tags?.length ? 0 : -1}
                    loading={notesLoading && !tags?.length}
                    optionsClassName='notes-select-options'
                    ArrowIcon={
                        <FontAwesomeIcon
                            className='select-icon'
                            icon={faArrowUpSolid}
                        />
                    }
                    offset={0}
                    value={tag}
                    className='notes-select --mobile'
                    options={tags}
                    disabled={!tags?.length}
                    error={notesError}
                    errorText={t('Error loading tags')}
                    disabledText={t('No tags created')}
                    placeholder={t('All tags')}
                    emptyText={t('No tags created')}
                    loadingText={t('Tags loading')}
                    onChange={setTag}
                />
                <label
                    className={`notes-view ${!notes?.length && '--disabled'}`}
                    onClick={e => !notes?.length && e.preventDefault()}
                >
                    <FontAwesomeIcon
                        tabIndex={notes?.length ? 0 : -1}
                        className={`view-icon ${(!notes?.length) && '--blocked'}`}
                        icon={faTableCellsSolid}
                        ref={gridRef}
                    />
                    <FontAwesomeIcon
                        tabIndex={notes?.length ? 0 : -1}
                        className={`view-icon ${(!notes?.length) && '--blocked'}`}
                        icon={faListSolid}
                        ref={listRef}
                    />
                    <input
                        readOnly
                        disabled={notesError}
                        type='checkbox'
                        checked={notesView == 'list'}
                        onChange={() => setNotesView(notesView == 'list' ? 'grid' : 'list')}
                    />
                </label>
            </div>
            {/* list */}
            <NotesList/>
            {renderHotkeys}
        </div>
    )
}

export default Notes