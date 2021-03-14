// Import Swiper React components
import SwiperCore, { Navigation, Pagination, Virtual } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import React, { Component } from "react";
import ClipLoader from "react-spinners/ClipLoader";

// Import Swiper styles
import 'swiper/swiper.scss';
import './Slider.scss';

// install Swiper modules
SwiperCore.use([Navigation, Pagination, Virtual]);

class Slider extends Component{
    constructor(){
        super();
        this.state = { topStories: [], 
                       storyData: [], 
                       currentStoriesSlice: [],
                       currentOffset: 10, 
                       storiesToLoad: 10,
                       loading: true,
                    }
    }

    async componentDidMount() {

        const topStoriesResult = await fetch(`https://hacker-news.firebaseio.com/v0/topstories.json`);
        const topStoriesJson = await topStoriesResult.json();
        const currentStoriesSlice = topStoriesJson.slice(0, this.state.currentOffset);

        var storyDataArray = await Promise.all(currentStoriesSlice.map(async (x) => {
            var result = await fetch(`https://hacker-news.firebaseio.com/v0/item/${x}.json`);
            return result.json();
        }));

        this.setState({topStories: topStoriesJson, 
                       storyData: storyDataArray, 
                       currentStoriesSlice: currentStoriesSlice,
                       loading: false
                      });
    }

    render() {
        console.log('render!');
        if( this.state.storyData.length > 0){
            const list = this.state.storyData.map(story => {
                return <SwiperSlide key={story.id} id={story.id}><div className="hacker-card">{story.title}</div></SwiperSlide>
            });
            return (
                <div className='slider-container'>
                    <Swiper
                        spaceBetween={50}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        onSlideChange={() => console.log('slide change')}
                        onSwiper={(swiper) => console.log(swiper)}>
                        {list}
                    </Swiper>
                    <div id='loading-icon' className='loading'>
                        <ClipLoader size={35} color='black' loading={this.state.loading} />
                    </div>
                </div>
            );
        }
            return(
                <div id='loading-icon' className='loading'>
                    <ClipLoader size={35} color='black' loading={this.state.loading} />
                </div>
            );
        }
}

export default Slider;