import { useContext, useEffect, useState } from "react";
import { Avatar, IconButton, Menu, MenuItem } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom";
import TimeAgo from "react-timeago";
import englishStrings from "react-timeago/lib/language-strings/en";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import "./post.css";

export const Post = ({ top, bottom, post }) => {
  const [user, setUser] = useState([]);
  const [like, setLike] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { user: currentUser } = useContext(AuthContext);

  const formatter = buildFormatter(englishStrings);

  useEffect(() => {
    const getUser = async () => {
      const res = await axios.get("http://localhost:3000/users?userId=" + post.userId);
      setUser(res.data);
    };
    getUser();
  }, [post.userId]);

  useEffect(() => {
    setIsLiked(post.likes.includes(currentUser._id));
  }, [currentUser._id, post.likes]);

  const likeHandler = async () => {
    try {
      await axios.put("http://localhost:3000/posts/" + post._id + "/like", {
        userId: currentUser._id,
      });
    } catch (err) {
      console.log(err);
    }
    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);
  };

  const deleteHandler = async () => {
    try {
      if (window.confirm("Are you sure?")) {
        const res = await axios.delete("http://localhost:3000/posts/" + post._id, {
          data: {
            userId: currentUser._id,
          },
        });
        if (res.status === 200) {
          toast.success(res.data);
          window.location.reload();
        }
      }
    } catch (err) {
      console.log(err);
    }
    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div className="post-wrapper">
      {top && (
        <div className="post-header">
          <div className="post-header-left">
            <Link to={"/profile/" + user.username}>
              <Avatar
                src={user.profilePicture && "http://localhost:3000/images/" + user.profilePicture}
                sx={{ width: 32, height: 32 }}
              />
            </Link>
            <Link to={"/profile/" + user.username} className="profile-username">
              {user.username}
            </Link>
          </div>
          <div className="post-header-right">
            <button onClick={handleClick}>
              <MoreHorizIcon />
            </button>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem onClick={handleClose}>
                <IconButton color="error" onClick={deleteHandler}>
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
              </MenuItem>
            </Menu>
          </div>
        </div>
      )}
      <div className="post-image">
        <img src={post && "http://localhost:3000/images/" + post.img} alt="Post Img" />
      </div>
      {bottom && (
        <div className="post-bottom">
          <div className="post-like">
            <button onClick={likeHandler}>
              <FavoriteIcon
                className={`post-like-icon ${isLiked && "active"}`}
              />
            </button>
          </div>
          <span className="post-like-count">
            {like} {like > 1 ? "likes" : "like"}
          </span>
          <div className="post-content">
            <Link to={"/profile/" + user.username} className="profile-username">
              {user.username}
            </Link>{" "}
            <span className="post-text">{post.desc}</span>
          </div>
          <div className="post-time">
            <TimeAgo date={post.createdAt} formatter={formatter} />
          </div>
        </div>
      )}
    </div>
  );
};
