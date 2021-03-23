import React, { Component } from "react";
import Moment from 'react-moment';
import './HackerCard.scss';

class HackerCard extends Component {
    render() {
        return (
            <div className={"hacker-card " + this.props.story.type} key={this.props.index}>
                <h2 className='story-title'>
                    <a href={this.props.calculatedUrl}>
                        {this.props.story.title}
                    </a>
                </h2>
                <div className='story-url'>{this.props.displayUrl}</div>
                <div className='points-info'>
                    <span>{this.props.story.score} points by {this.props.story.by} </span>
                    <span id="comment-count">
                        | {this.props.story.descendants ? this.props.story.descendants : 0} comments 
                    </span>
                    <span> | <Moment unix fromNow>{this.props.story.time}</Moment></span>
                      
                </div>
                { (this.props.story.type !== 'job') &&
                    <div className='top-comments'>
                        {(this.props.topComments !== undefined && this.props.topComments.length > 0) ? <h3>Top Comments</h3> : ''}
                        {(this.props.topComments !== undefined && this.props.topComments.length > 0) ? this.props.topComments.map((comment, index) =>
                            <div className="comment" key={index}>
                                <div className="comment-by">{comment.by} said:</div>
                                <div className="comment-text" dangerouslySetInnerHTML={{ __html: comment.text }}></div>
                            </div>
                        ) : <div className="no-comments">No comments yet</div>}
                    </div> }

                {
                    (this.props.story.type !== 'job') &&
                    <div className="see-on-hn-overlay">
                        <div className="see-on-hn">
                            <a href={this.props.hnUrl}>Read on HN</a>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

export default HackerCard;
