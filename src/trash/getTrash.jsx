import Cookies from 'js-cookie'
import {appStore} from '../store'

const getTrash = (
    path = 'trash',
    page = 1,
    setDeletedLoading = () => {},
    setArchivedLoading = () => {},
    setLastPage = () => {}
) => {
    const {setTrash, setArchive} = appStore.getState()
    //
    const token = [
        localStorage.getItem('token'),
        Cookies.get('token')
    ].find(
        token => token
    &&
        token !== 'null'
    )

    const trashUrl =
        `http://api.notevault.pro/api/v1/notes` +
        `?${path == 'trash' ? 'deleted' : 'archived'}=true` +
        `&page=${page}`

    path == 'trash' ? setDeletedLoading(true) : setArchivedLoading(true)
    fetch(trashUrl, {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            authorization: 
                `Bearer ${token}`
    }})
    .then(res => res.json())
    .then(resData => {
    setLastPage?.(resData.last_page)
    if (path == 'trash') {
        page == 1 ? setTrash(resData.data) : setTrash(prev => [...prev, ...resData.data])
        setDeletedLoading(false)
    } else
        page == 1 ? setArchive(resData.data) : setArchive(prev => [...prev, ...resData.data])
        setArchivedLoading(false)
})}

export default getTrash