import { signup as signupApi } from "@/api/authApi";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useSetupForm() {
    const navigate = useNavigate();
    const location = useLocation();

    // SignupPage에서 넘어온 기본 정보만 사용
    const basicInfo = location.state?.basicInfo || null;

    const [level, setLevel] = useState(20); // 하루 목표 단어 수
    const [selected, setSelected] = useState([]); // 관심 분야 배열
    const [goal, setGoal] = useState(""); // 학습 목표 텍스트
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!basicInfo) {
            navigate("/auth/signup", { replace: true });
        }
    }, [basicInfo, navigate]);

    const toggleField = (value) => {
        setSelected((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const handleRegister = async (options = {}) => {
        if (!basicInfo) return;

        const {
            overridePreference = null,
            overrideGoal = null,
            overrideDailyWordGoal = null,
        } = options;

        setSubmitting(true);
        setError("");

        const preferenceValue =
            overridePreference ?? (selected.length > 0 ? selected.join(",") : null);

        const goalValue = overrideGoal ?? (goal || null);

        const dailyWordGoalValue =
            overrideDailyWordGoal ?? (level ? Number(level) : 20);

        try {
            await signupApi({
                email: basicInfo.email,
                password: basicInfo.password,
                nickname: basicInfo.nickname,
                userName: basicInfo.userName,
                userBirth: basicInfo.userBirth,
                preference: preferenceValue,
                goal: goalValue,
                dailyWordGoal: dailyWordGoalValue,
            });

            navigate("/auth/login", { replace: true });
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.";
            setError(message);
            setSubmitting(false);
        }
    };

    const handleComplete = () => {
        handleRegister();
    };

    const handleSkip = () => {
        handleRegister({
            overridePreference: null,
            overrideGoal: null,
            overrideDailyWordGoal: 20,
        });
    };

    return {
        level,
        selected,
        goal,
        submitting,
        error,
        toggleField,
        handleComplete,
        handleSkip,
    }
}