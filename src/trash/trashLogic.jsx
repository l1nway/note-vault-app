import {useState, useEffect, useRef, useMemo, useCallback} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {useLocation} from 'react-router'
import Cookies from 'js-cookie'

import {clarifyStore, apiStore} from '../store'
import getTrash from './getTrash'

function trashLogic() {
  const online = apiStore(state => state.online)
  
  const token = useMemo(() => [localStorage.getItem('token'), Cookies.get('token')].find(t => t && t !== 'null'), [])

  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(0)

  // used to determine whether the component will perform the login or registration function
  const location = useLocation()
  const path = useMemo(
    () => location.pathname.slice(1),
  [location.pathname])

  const {setAction, setVisibility, animating, setAnimating, setErrorAction, deletedLoading, setDeletedLoading, archivedLoading, setArchivedLoading} = clarifyStore(
    useShallow((state) => ({
      // action being performed and its purpose
      setAction: state.setAction,
      // <Clarify/> window visibility
      setVisibility: state.setVisibility,
      // animation status (used to block unwanted player actions during an animation that could break the animation)
      animating: state.animating,
      setAnimating: state.setAnimating,
      setErrorAction: state.setErrorAction,
      deletedLoading: state.deletedLoading,
      setDeletedLoading: state.setDeletedLoading,
      archivedLoading: state.archivedLoading,
      setArchivedLoading: state.setArchivedLoading,
  })))

  const loadMore = useCallback(() => {
    if (page < lastPage) {
        setPage(prev => prev + 1)
    }
  }, [lastPage])

  useEffect(() => {
    setPage(1)
    if (Cookies.get('offline') != 'true' && !online) {
      alert('нет инета и оффлайн режима')
      path == 'trash' ? setDeletedLoading (false) : setArchivedLoading(false)
    }
  }, [online, path])

  // triggers the function execution on the first load
  useEffect(() => {if (online && token) {
    getTrash(path, page, setDeletedLoading, setArchivedLoading, setLastPage)
  }}, [page, path, online, token])

  // refs for correctly setting focus on the checkbox imitation
  const gridRef = useRef(null)
  const listRef = useRef(null)

  const [catsView, setCatsView] = useState('grid')
  const listView = catsView == 'list'

  // пока что не используется
  const [selectedNotes, setSelectedNotes] = useState([])

  const selectNote = useCallback((note) => {
    setSelectedNotes(prev =>
      prev.includes(note)
        // add
        ? prev.filter(i => i !== note)
        // remove
        : [...prev, note]
    )
  }, [setSelectedNotes])

  const [elementID, setElementID] = useState('')
  // 

  const openAnim = useCallback((action) => {
    if (animating == true) {
        return false
    }
    setAnimating(true)
    setAction(action)
    setErrorAction(action)

    setTimeout(() => {
        setVisibility(true)
    }, 10)

    setTimeout(() => {
        setAnimating(false)
    }, 300)
  }, [setAnimating, setAction, setErrorAction, setVisibility])

    return {loadMore, lastPage, page, deletedLoading, archivedLoading, path, selectedNotes, catsView, listView, elementID, gridRef, listRef, getTrash, setCatsView, selectNote, setElementID, openAnim}
}

export default trashLogic