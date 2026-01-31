# 🚀 Mock API Server - 설치 불필요!

## ✨ 특징
- **의존성 제로**: Python 기본 라이브러리만 사용
- **즉시 실행**: pip install 필요 없음
- **완전한 기능**: ROI 계산 로직 포함
- **CORS 설정 완료**: 프론트엔드 바로 연결

## 🏃 실행 방법

### 1. Mock API 서버 실행

```bash
# 프로젝트 루트에서
python3 simple_mock_server.py
```

출력 예시:
```
🚀 Mock API Server running on http://localhost:8000
📊 API Docs: http://localhost:8000/api/health
🧮 Calculate endpoint: POST http://localhost:8000/api/calculate

Press Ctrl+C to stop
```

### 2. 프론트엔드 실행 (새 터미널)

```bash
cd frontend
npm install
npm run dev
```

### 3. 브라우저 열기

http://localhost:3000

끝! 🎉

---

## 📡 API 엔드포인트

### GET /api/health
서버 상태 확인

**응답:**
```json
{"status": "healthy"}
```

### POST /api/calculate
ROI 계산

**요청 예시:**
```json
{
  "school_size": 50,
  "avg_salary": 48892,
  "attrition_rate": 8.8,
  "avg_sick_days": 7,
  "supply_rate": 180,
  "ai_cost_per_teacher": 100,
  "workload_level": 70,
  "training_cost": 2000,
  "setup_cost": 1500,
  "absenteeism_reduction": 20,
  "retention_improvement": 5,
  "time_horizon": 5
}
```

**응답:**
```json
{
  "annual_ai_cost": 5000,
  "total_annual_savings": 147600,
  "net_annual_benefit": 142600,
  "payback_period": 0.025,
  "yearly_data": [...]
}
```

---

## ❓ 문제 해결

### 포트 8000이 이미 사용 중
```bash
# 다른 포트 사용 (서버 코드 수정 필요)
python3 simple_mock_server.py
# 또는 8000 포트 프로세스 종료
lsof -ti:8000 | xargs kill -9
```

### CORS 에러
이미 설정되어 있으므로 발생하지 않습니다!

### Python 버전 확인
```bash
python3 --version
# Python 3.6 이상이면 OK
```

---

## 💡 왜 FastAPI 대신 이걸 쓰나요?

**FastAPI 방식:**
- ❌ pip install 필요
- ❌ 의존성 관리 필요
- ❌ Python 3.13 호환성 문제
- ❌ 복잡한 설정

**Simple Mock Server:**
- ✅ 설치 불필요
- ✅ 의존성 제로
- ✅ 모든 Python 버전 호환
- ✅ 즉시 실행

개발 단계에서는 이게 훨씬 간편합니다!

나중에 백엔드 팀원이 FastAPI로 실제 API를 만들면 그때 교체하면 됩니다.

---

## 🔄 실제 백엔드로 전환하기

백엔드 팀원이 API를 완성하면:

1. `frontend/app/page.tsx` 파일 열기
2. 8번째 줄 수정:
   ```typescript
   const API_URL = 'http://localhost:8000';  // Mock
   // 👇 실제 백엔드 URL로 변경
   const API_URL = 'https://your-backend-api.com';
   ```

끝!
