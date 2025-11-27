import { Wand2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import { createAiStory } from "../../api/storyApi"; 
import Input from "../../components/common/Input";
import "./StoryCreatePage.css";

const StoryCreatePage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 페이지 이동 훅

  // 퀴즈/단어장에서 넘겨준 단어들
  const baseWords = location.state?.baseWords || [];

  const [title, setTitle] = useState("");
  const [selectedWords, setSelectedWords] = useState(baseWords);
  const [prompt, setPrompt] = useState("");
  
  // 🔧 로딩 상태 추가
  const [isGenerating, setIsGenerating] = useState(false);

  const handleToggleWord = (word) => {
    setSelectedWords((prev) =>
      prev.includes(word)
        ? prev.filter((w) => w !== word)
        : [...prev, word]
    );
  };

  const handleGenerate = async () => {
    // 1. 유효성 검사 (제목과 프롬프트 필수)
    if (!title.trim() || !prompt.trim()) {
      alert("스토리 제목과 프롬프트를 모두 입력해주세요!");
      return;
    }

    try {
      setIsGenerating(true); // 로딩 시작 (버튼 비활성화)

      // 2. API 호출
      const requestData = {
        title: title,
        prompt: prompt,
        keywords: selectedWords
      };

      const res = await createAiStory(requestData);
      
      console.log("생성 완료:", res);
      // 3. 생성된 스토리 상세 페이지로 이동
      navigate(`/story/${res.storyId}`);

    } catch (err) {
      console.error(err);
      alert("스토리 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false); // 로딩 끝
    }
  };

  return (
    <div className="story-create-page">
      <header className="story-create-header">
        <div>
          <h1 className="story-create-title">새 스토리 만들기</h1>
          <p className="story-create-subtitle">
            선택한 단어와 간단한 프롬프트로 AI가 이야기를 만들어 줍니다.
          </p>
        </div>
      </header>

      <main className="story-create-main">
        <section className="story-create-form">
          {/* 제목 입력 */}
          <Input
            label="스토리 제목"
            placeholder="예: First Snow in My City"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* 프롬프트 입력 */}
          <div className="story-create-field">
            <label className="story-create-label">프롬프트 / 상황 설명</label>
            <textarea
              className="story-create-textarea"
              placeholder="예: 겨울 방학 첫날, 친구들과 눈사람을 만드는 이야기로 만들어줘."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          {/* 단어 선택 칩 (데이터가 있을 때만 표시) */}
          {baseWords.length > 0 && (
            <div className="story-create-field">
              <label className="story-create-label">
                사용할 단어 선택 (오답/학습 단어)
              </label>
              <div className="story-create-word-chips">
                {baseWords.map((word) => {
                  const active = selectedWords.includes(word);
                  return (
                    <button
                      key={word}
                      type="button"
                      className={
                        "story-create-chip" +
                        (active ? " story-create-chip--active" : "")
                      }
                      onClick={() => handleToggleWord(word)}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 생성 버튼 (로딩 중일 때 스타일 변경) */}
          <button
            type="button"
            className={`story-create-generate-button ${isGenerating ? 'disabled' : ''}`}
            onClick={handleGenerate}
            disabled={isGenerating} // 로딩 중 클릭 방지
          >
            <Wand2 className={`icon-sm ${isGenerating ? 'spin-animation' : ''}`} />
            <span>{isGenerating ? "AI가 이야기를 쓰는 중..." : "AI로 스토리 생성"}</span>
          </button>
        </section>
      </main>
    </div>
  );
};

export default StoryCreatePage;