// Import Swiper React components
import SwiperCore, { Navigation, Pagination, Virtual } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import React, { Component } from "react";

// Import Swiper styles
import 'swiper/swiper.scss';
import './Slider.scss';

// install Swiper modules
SwiperCore.use([Navigation, Pagination, Virtual]);

class Slider extends Component{
    constructor(){
        super();
        this.state = { topStories: [], storyData: [], currentOffset: 10, storiesToLoad: 10}
    }

    async componentDidMount() {

        const topStories = await fetch(`https://hacker-news.firebaseio.com/v0/topstories.json`);
        console.log("TOP STORIES");
        console.log(await topStories.json());

        fetch(`https://hacker-news.firebaseio.com/v0/topstories.json`)
            .then(res => res.json())
            .then(json => {
                this.setState({ topStories: json });
                var currentItems = this.state.topStories.slice(this.state.currentOffset - this.state.storiesToLoad, this.state.currentOffset);
                var itemsArray = [];
                currentItems.forEach(x => {
                    fetch(`https://hacker-news.firebaseio.com/v0/item/${x}.json`)
                        .then(res => res.json())
                        .then(json => {
                            itemsArray.push(json);
                    });
                });

                console.log(itemsArray);
                this.setState({ storyData: itemsArray });

            });
    }

    render() {
        console.log('render!');
        if( this.state.storyData.length > 0){
            const list = this.state.storyData.map(story => <SwiperSlide key={story} id={story.id}><div className="hacker-card">{story.title}</div></SwiperSlide> );
            console.log('logging list');
            console.log(list);
            return (
                <div className='sliderContainer'>
                    
                    <Swiper
                        spaceBetween={50}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        onSlideChange={() => console.log('slide change')}
                        onSwiper={(swiper) => console.log(swiper)}>
                        {list}
                    </Swiper>
                </div>
    
            );
        }
        return("Nothing here")
        }
}

export default Slider;