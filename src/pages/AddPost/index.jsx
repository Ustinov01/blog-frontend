import { useState, useRef, useCallback, useMemo } from "react";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import SimpleMDE from "react-simplemde-editor";
import { selectIsAuth } from "../../redux/slices/auth";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "../../axios";

import "easymde/dist/easymde.min.css";
import styles from "./AddPost.module.scss";

export const AddPost = () => {
  const isAuth = useSelector(selectIsAuth);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setimageUrl] = useState("");

  const inputFileRef = useRef(null);

  const onChange = useCallback((value) => {
    setText(value);
  }, []);

  const handleChangeFile = async (event) => {
    try {
      const formData = new FormData();
      const file = event.target.files[0];
      formData.append("image", file);
      const { data } = await axios.post("/upload", formData);
      setimageUrl(data.url);
    } catch (error) {
      console.warn(error);
      alert("Ошибка загрузки файла");
    }
  };

  const onClickRemoveImage = () => {
    setimageUrl("");
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      console.log(imageUrl);

      const fields = {
        title,
        text,
        imageUrl,
        tags: tags.split(","),
      };

      const { data } = await axios.post("/posts", fields);

      const id = data._id;

      navigate(`/posts/${id}`);
    } catch (error) {
      console.warn(error);
      alert("Ошибка загрузки файла");
    }
  };

  const options = useMemo(
    () => ({
      spellChecker: false,
      maxHeight: "400px",
      autofocus: true,
      placeholder: "Введите текст...",
      status: false,
      autosave: {
        enabled: true,
        delay: 1000,
      },
    }),
    []
  );

  if (!window.localStorage.getItem("token") && !isAuth) {
    return <Navigate to="/" />;
  }

  return (
    <Paper style={{ padding: 30 }}>
      <Button
        onClick={() => inputFileRef.current.click()}
        variant="outlined"
        size="large"
      >
        Загрузить превью
      </Button>
      <input
        ref={inputFileRef}
        type="file"
        onChange={handleChangeFile}
        hidden
      />
      {imageUrl && (
        <>
          <Button
            variant="contained"
            color="error"
            onClick={onClickRemoveImage}
          >
            Удалить
          </Button>
          <img
            style={{ width: "100%" }}
            src={`http://localhost:4444${imageUrl}`}
            alt="Uploaded"
          />
        </>
      )}
      <br />
      <br />
      <TextField
        classes={{ root: styles.title }}
        variant="standard"
        placeholder="Заголовок статьи..."
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        classes={{ root: styles.tags }}
        variant="standard"
        placeholder="Тэги"
        fullWidth
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <SimpleMDE
        className={styles.editor}
        value={text}
        onChange={onChange}
        options={options}
      />
      <div className={styles.buttons}>
        <Button onClick={onSubmit} size="large" variant="contained">
          Опубликовать
        </Button>
        <Button size="large">Отмена</Button>
      </div>
    </Paper>
  );
};
