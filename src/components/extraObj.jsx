import React, {useMemo} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import ContentLoader from 'react-content-loader'
import {useMediaQuery} from 'react-responsive'
import {useTranslation} from 'react-i18next'

const ExtraObj = React.memo(({listView = false, loading = false, page = 1, lastPage = 1, loadMore = null}) => {
    const {t} = useTranslation()
    const mobile = useMediaQuery({query: '(max-width: 1024px)'})

    const skeletonProps = useMemo(() => ({
        className: 'note-element',
        speed: 2,
        width: '100%',
        height: '100%',
        backgroundColor: '#1e2939', 
        foregroundColor: '#72bf00',
        preserveAspectRatio: 'none',
    }), [])

    const loaderProps = useMemo(() => ({rx:'4', ry:'4'}), [])

    const skeleton = useMemo(() => listView
        ?
            <ContentLoader
                className='--checked'
                {...skeletonProps}
            >
                {/* 
                    rx & ry -- border-radius
                    x -- расположение по горизонтали
                    y -- расположение по вертикали
                */}
                {/* title */}
                <rect {...loaderProps} x='1%' y='1%'width='30%' height='45%'/>
                {/* desc */}
                <rect {...loaderProps} x='1%' y='60%' width='40%' height='40%'/>
                {/* tags */}
                <rect {...loaderProps} x='60%' y='28%' width='8%' height='50%'/>
                <rect {...loaderProps} x='69%' y='28%' width='9%' height='50%'/>
                <rect {...loaderProps} x='79%' y='28%' width='7%' height='50%'/>
                {/* date */}
                <rect {...loaderProps} x='87%' y='28%' width='5%' height='50%'/>
            </ContentLoader>
        :
            <ContentLoader
                {...skeletonProps}
            >
                {/* 
                    rx & ry -- border-radius
                    x -- расположение по горизонтали
                    y -- расположение по вертикали
                */}
                {/* title */}
                <rect {...loaderProps} x='1%' y='5%' width='80%' height='28%'/>
                {/* desc */}
                <rect {...loaderProps} x='1%' y='40%' width='70%' height='25%'/>
                {/* tags */}
                <rect {...loaderProps} x='1%' y='75%' width='20%' height='20%'/>
                <rect {...loaderProps} x='23%' y='75%' width='20%' height='20%'/>
                <rect {...loaderProps} x='45%' y='75%' width='20%' height='20%'/>
                {/* date */}
                <rect {...loaderProps} x='85%' y='75%' width='15%' height='20%'/>
            </ContentLoader>
    , [listView])

    const mobileSkeleton = useMemo(() => listView
        ?
            <ContentLoader
                {...skeletonProps}
            >
                {/* 
                    rx & ry -- border-radius
                    x -- расположение по горизонтали
                    y -- расположение по вертикали
                */}
                {/* title */}
                <rect {...loaderProps} x='1%' y='7%' width='30%' height='17%'/>
                {/* desc */}
                <rect {...loaderProps} x='1%' y='35%' width='40%' height='15%'/>
                <rect {...loaderProps} x='1%' y='55%' width='40%' height='15%'/>
                <rect {...loaderProps} x='1%' y='75%' width='40%' height='15%'/>
                {/* tags */}
                <rect {...loaderProps} x='50%' y='7%' width='25%' height='15%'/>
                <rect {...loaderProps} x='50%' y='35%' width='20%' height='15%'/>
                <rect {...loaderProps} x='50%' y='55%' width='20%' height='15%'/>
                <rect {...loaderProps} x='50%' y='75%' width='20%' height='15%'/>
                {/* date */}
                <rect {...loaderProps} x='75%' y='75%' width='15%' height='15%'/>
            </ContentLoader>
        :
            <ContentLoader
                {...skeletonProps}
            >
                {/* 
                    rx & ry -- border-radius
                    x -- расположение по горизонтали
                    y -- расположение по вертикали
                */}
                {/* title */}
                <rect {...loaderProps} x='5%' y='5%' width='70%' height='15%'/>
                {/* desc */}
                <rect {...loaderProps} x='5%' y='25%' width='60%' height='15%'/>
                {/* tags */}
                <rect {...loaderProps} x='5%' y='60%' width='30%' height='15%'/>
                <rect {...loaderProps} x='40%' y='60%' width='30%' height='15%'/>
                <rect {...loaderProps} x='5%' y='80%' width='40%' height='15%'/>
                {/* date */}
                <rect {...loaderProps} x='70%' y='80%' width='25%' height='15%'/>
            </ContentLoader>
    , [listView])

    const motionProps = useMemo(() => ({
        className: `note-animated-element ${listView ? '--checked' : ''}`,
        style: {
            willChange: 'transform, opacity, height',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
        },
        layout: true,
        viewport: {
            once: false,
            amount: 0.1,
            margin: '0px 0px 0px 0px'
        },
        initial: {
            opacity: 0,
            scale: 0.9
        },
        whileInView: {
            opacity: 1,
            scale: 1
        },
        transition: {
            layout: { 
                type: 'spring', 
                stiffness: 300, 
                damping: 30
            },
            default: { 
                duration: 0.3, 
                ease: 'easeInOut'
            },
            opacity: {duration: 0.3}
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            transition: {
                duration: 0.3
            }
        }
    }), [listView])

    return (
        <AnimatePresence>
        {/* loading skeleton */}
            {loading ?
                <motion.div
                {...motionProps}
                >
                    {mobile ? mobileSkeleton : skeleton}
                </motion.div>
            : null}
        {/* load more button */}
            {(page < lastPage) && !loading ?
                <motion.div
                    onClick={loadMore}
                    {...motionProps}
                >
                    <div
                        className='load-more-button'
                    >
                        <span
                            className='load-more-text'
                        >
                            {t('Load more')}
                        </span>
                    </div>
                </motion.div>
            : null}
        </AnimatePresence>
    )
})

export default ExtraObj