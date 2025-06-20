import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)


// Supabase에 점수를 저장하는 함수입니다. -성훈
export async function saveScore(nickname, score) {
  const { data, error } = await supabase
    .from('scores')
    .insert([{ nickname, score }])
    .select()
    .single();

  if (error) {
    console.error("❌ 저장 실패:", error);
  } else {
    window.myScoreId = data.id;
    console.log("✅ 저장 완료:", nickname, score);
  }
}

// Supabase에서 20등까지 정보를 불러오는 코드입니다. -성훈
export async function loadScore() {
    const scoreBoard = document.getElementById("score-board");
    scoreBoard.style.display = "flex";

    // Supabase에서 상위 20개 불러오기
    const { data, error } = await supabase
        .from('scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(20);

    if (error) {
        console.error("❌ 점수 불러오기 실패:", error);
        return [];
    }

    return data;
}