const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 데이터베이스 초기화
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
  } else {
    console.log('SQLite 데이터베이스에 연결되었습니다.');
    initDatabase();
  }
});

// 데이터베이스 테이블 초기화
function initDatabase() {
  // 아이템 테이블 생성
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    selects INTEGER DEFAULT 0,
    passes INTEGER DEFAULT 0,
    category TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('테이블 생성 오류:', err.message);
    } else {
      console.log('items 테이블이 생성되었습니다.');
      // 초기 데이터 삽입
      insertInitialData();
    }
  });
}

// 초기 데이터 삽입
function insertInitialData() {
  const initialItems = [
    {
      name: "에어 조던 1",
      description: "농구화에서 시작해 스트릿 패션 아이콘이 된 클래식 스니커즈",
      image: "/placeholder.svg?height=400&width=600",
      selects: 120,
      passes: 45,
      category: "신발"
    },
    {
      name: "컨버스 척 테일러",
      description: "100년 이상의 역사를 가진 캔버스 스니커즈",
      image: "/placeholder.svg?height=400&width=600",
      selects: 200,
      passes: 30,
      category: "신발"
    },
    {
      name: "아디다스 스탠 스미스",
      description: "깔끔한 디자인의 클래식 테니스화",
      image: "/placeholder.svg?height=400&width=600",
      selects: 180,
      passes: 60,
      category: "신발"
    },
    {
      name: "오버사이즈 후드티",
      description: "편안한 착용감의 캐주얼 후드티",
      image: "/placeholder.svg?height=400&width=600",
      selects: 150,
      passes: 70,
      category: "의류"
    },
    {
      name: "슬림핏 데님 청바지",
      description: "모든 스타일에 어울리는 기본 청바지",
      image: "/placeholder.svg?height=400&width=600",
      selects: 90,
      passes: 110,
      category: "의류"
    },
    {
      name: "베이직 티셔츠",
      description: "부드러운 코튼 소재의 기본 티셔츠",
      image: "/placeholder.svg?height=400&width=600",
      selects: 130,
      passes: 50,
      category: "의류"
    },
    {
      name: "가죽 시계",
      description: "클래식한 디자인의 가죽 스트랩 시계",
      image: "/placeholder.svg?height=400&width=600",
      selects: 110,
      passes: 40,
      category: "악세사리"
    },
    {
      name: "실버 목걸이",
      description: "심플한 디자인의 실버 펜던트 목걸이",
      image: "/placeholder.svg?height=400&width=600",
      selects: 95,
      passes: 65,
      category: "악세사리"
    },
    {
      name: "캔버스 백팩",
      description: "일상 사용에 적합한 내구성 있는 백팩",
      image: "/placeholder.svg?height=400&width=600",
      selects: 85,
      passes: 75,
      category: "악세사리"
    }
  ];

  // 기존 데이터가 있는지 확인
  db.get("SELECT COUNT(*) as count FROM items", (err, row) => {
    if (err) {
      console.error('데이터 확인 오류:', err.message);
      return;
    }

    if (row.count === 0) {
      // 초기 데이터 삽입
      const stmt = db.prepare(`INSERT INTO items (name, description, image, selects, passes, category) 
                               VALUES (?, ?, ?, ?, ?, ?)`);
      
      initialItems.forEach(item => {
        stmt.run(item.name, item.description, item.image, item.selects, item.passes, item.category);
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('초기 데이터 삽입 오류:', err.message);
        } else {
          console.log('초기 데이터가 삽입되었습니다.');
        }
      });
    }
  });
}

// API 라우트

// 모든 아이템 조회
app.get('/api/items', (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM items';
  let params = [];

  if (category && category !== 'all') {
    query += ' WHERE category = ?';
    params.push(category);
  }

  query += ' ORDER BY (selects - passes) DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 특정 아이템 조회
app.get('/api/items/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM items WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
      return;
    }
    res.json(row);
  });
});

// 투표 처리 (선택 또는 패스)
app.post('/api/items/:id/vote', (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'select' 또는 'pass'

  if (!action || (action !== 'select' && action !== 'pass')) {
    res.status(400).json({ error: '유효하지 않은 액션입니다.' });
    return;
  }

  const column = action === 'select' ? 'selects' : 'passes';
  
  db.run(`UPDATE items SET ${column} = ${column} + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, 
    [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
        return;
      }
      res.json({ message: '투표가 처리되었습니다.' });
    });
});

// 카테고리별 통계
app.get('/api/stats/categories', (req, res) => {
  db.all(`SELECT 
            category,
            COUNT(*) as itemCount,
            SUM(selects) as totalSelects,
            SUM(passes) as totalPasses
          FROM items 
          GROUP BY category`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 전체 통계
app.get('/api/stats/overall', (req, res) => {
  db.get(`SELECT 
            COUNT(*) as totalItems,
            SUM(selects) as totalSelects,
            SUM(passes) as totalPasses,
            SUM(selects + passes) as totalVotes
          FROM items`, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// 새 아이템 추가
app.post('/api/items', (req, res) => {
  const { name, description, image, category } = req.body;

  if (!name || !category) {
    res.status(400).json({ error: '이름과 카테고리는 필수입니다.' });
    return;
  }

  db.run(`INSERT INTO items (name, description, image, category) 
           VALUES (?, ?, ?, ?)`, 
    [name, description, image, category], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ 
        id: this.lastID,
        message: '아이템이 추가되었습니다.' 
      });
    });
});

// 아이템 수정
app.put('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, image, category } = req.body;

  if (!name || !category) {
    res.status(400).json({ error: '이름과 카테고리는 필수입니다.' });
    return;
  }

  db.run(`UPDATE items 
           SET name = ?, description = ?, image = ?, category = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`, 
    [name, description, image, category, id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
        return;
      }
      res.json({ message: '아이템이 수정되었습니다.' });
    });
});

// 아이템 삭제
app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM items WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
      return;
    }
    res.json({ message: '아이템이 삭제되었습니다.' });
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`API 엔드포인트: http://localhost:${PORT}/api`);
});

// 프로세스 종료 시 데이터베이스 연결 종료
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('데이터베이스 연결 종료 오류:', err.message);
    } else {
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
    process.exit(0);
  });
}); 