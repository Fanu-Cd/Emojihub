import { Select, Input, Popover } from "antd";
import { useEffect, useState, useRef } from "react";
import { Modal, Tooltip, Button, message } from "antd";
import { CopyOutlined, DownloadOutlined } from "@ant-design/icons";
import html2canvas from "html2canvas";

const Emojis = () => {
  const { Search } = Input;
  const onCategoryChange = (value) => {
    setSelectedCategory(value);
    getEmojis(value);
  };

  const onSearchChange = (e) => {
    if (e.target.value === "") {
      setEmojis(oldEmojis);
      return;
    }
    setEmojis(emojis.filter((emoji) => emoji.slug.includes(e.target.value)));
  };

  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [emojis, setEmojis] = useState([]);
  const [oldEmojis, setOldEmojis] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [status, setStatus] = useState({ loading: false });

  useEffect(() => {
    getAllCategories();
    getEmojis("All");
  }, []);

  const getAllCategories = () => {
    const emojiapiKey = "24e2c24d34bdff2c64ee138e9a3adafd9af71b08";
    const url = `https://emoji-api.com/categories?access_key=${emojiapiKey}`;
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        setAllCategories([{ slug: "All", label: "All" }, ...res]);
      });
  };

  const getEmojis = (name) => {
    setStatus({ ...status, loading: true });
    const emojiapiKey = "24e2c24d34bdff2c64ee138e9a3adafd9af71b08";
    const url =
      name === "All"
        ? `https://emoji-api.com/emojis?access_key=${emojiapiKey}`
        : `https://emoji-api.com/categories/${name}?access_key=${emojiapiKey}`;
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        setEmojis(res);
        setOldEmojis(res);
        setStatus({ ...status, loading: false });
      });
  };

  const success = () => {
    messageApi.open({
      type: "success",
      content: "Copied to clipboard!",
    });
  };

  const error = () => {
    messageApi.open({
      type: "error",
      content: "Some Error Occurred!",
    });
  };

  const emojiRef = useRef(null);
  const handleDownload = () => {
    html2canvas(emojiRef.current).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL();
      link.download = `${selectedEmoji.slug}.png`;
      link.click();
    });
  };

  return (
    <>
      <div
        style={{ width: "90%", minHeight: "30rem", height: "auto" }}
        className="d-flex p-2 flex-column align-items-center mx-auto border rounded mt-5"
      >
        <h3>EmojiHub ✌️</h3>
        <div
          className="mx-auto p-1 mt-5"
          style={{ minHeight: "3rem", height: "auto", width: "70%" }}
        >
          <div className="row">
            <Select
              defaultValue="All"
              size="large"
              className="col-3"
              onChange={onCategoryChange}
              options={allCategories.map((category) => {
                return { value: category.slug, label: category.slug };
              })}
              value={selectedCategory}
            />
            <Search
              placeholder="Search Emoji"
              allowClear
              size="large"
              className="col-9"
              onChange={onSearchChange}
            />
          </div>
        </div>
        <div
          className="container-fluid p-1 mt-2"
          style={{ minHeight: "3rem", height: "auto" }}
        >
          <div
            style={{ width: "50%" }}
            className="mx-auto d-flex justify-content-center align-items-center mt-1"
          >
            {emojis &&
              emojis.slice(0, 10).map((emoji) => {
                return (
                  <p key={emoji.codePoint} className="d-inline fs-4">
                    {emoji.character}
                  </p>
                );
              })}
          </div>
        </div>
        <div
          className="container-fluid shadow rounded p-1 mt-2"
          style={{ minHeight: "3rem", height: "auto" }}
        >
          <div
            style={{ width: "90%", height: "25rem" }}
            className="mx-auto mt-1 d-flex flex-column"
          >
            <small className="text-center">
              {selectedCategory === "All"
                ? "All Emojis"
                : `Emojis Under ${selectedCategory}`}
            </small>
            {status.loading === true ? (
              <div className="d-flex flex-column justify-content-center align-items-center mt-5">
                <p className="fs-1">😋</p>
                <small>Getting Emojis...</small>
              </div>
            ) : !emojis ? (
              <div className="d-flex flex-column justify-content-center align-items-center mt-5">
                <p className="fs-1">😞</p>
                <small className="text-danger">No Emoji Found</small>
              </div>
            ) : (
              <div
                className="container-fluid p-1 mt-2 custom-scrollbar"
                style={{ minHeight: "3rem", height: "auto", overflow: "auto" }}
              >
                <div className="mx-auto mt-1">
                  {emojis &&
                    emojis.map((emoji) => {
                      return (
                        <Tooltip
                          placement="top"
                          title={emoji.slug}
                          overlayClassName="tooltip-style"
                          key={emoji.codePoint}
                        >
                          <p
                            style={{
                              cursor: "pointer",
                              backgroundColor: "inherit",
                            }}
                            onClick={() => {
                              setIsModalOpen(true);
                              setSelectedEmoji(emoji);
                            }}
                            className="d-inline fs-4"
                          >
                            {emoji.character}
                          </p>
                        </Tooltip>
                      );
                    })}
                </div>
              </div>
            )}
            <Modal
              title={selectedEmoji.slug}
              open={isModalOpen}
              footer=""
              onCancel={() => {
                setIsModalOpen(false);
              }}
            >
              {contextHolder}
              <div className="d-flex flex-column justify-content-between align-items-center">
                <p className="fs-1" ref={emojiRef}>
                  {selectedEmoji.character}
                </p>
                <div className="d-flex justify-content-between align-items-center container-fluid">
                  <Button
                    onClick={() => {
                      navigator.clipboard
                        .writeText(selectedEmoji.character)
                        .then(() => {
                          success();
                        })
                        .catch((err) => {
                          error();
                        });
                    }}
                    icon={<CopyOutlined />}
                  >
                    Copy to Clipboard
                  </Button>
                  <Button
                    onClick={() => {
                      handleDownload();
                    }}
                    className="bg-primary text-white"
                    icon={<DownloadOutlined />}
                  >
                    Download as PNG
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>
      <div className="col-12 w-100 mb-2 mt-5 d-flex justify-content-center align-items-center">
        <Popover
          content={
            <div>
              <p className="text-center m-0">Software Developer</p>
              <ul className="">
                <li>Github : /fanu-cd</li>
                <li>LinkedIn : /fanucd</li>
              </ul>
            </div>
          }
          title={<p className="m-0 text-center">Fanuel Amare</p>}
        >
          Developed By 🧑‍💻 <u className="">Fanuel Amare</u>
        </Popover>
      </div>
    </>
  );
};
export default Emojis;
