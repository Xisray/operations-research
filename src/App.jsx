import { useState } from 'react'
import './App.css'


const PRESET = {
  alternatives: [
    { name: "Глубокий пакетный анализ (DPA)", values: [0.96, 0.8, 90, 1200] },
    { name: "Потоковая фильтрация (SF)", values: [0.88, 2.5, 40, 400] },
    { name: "Гибридный метод (HM)", values: [0.92, 1.2, 60, 700] },
    { name: "Сигнатурный детектор (SD)", values: [0.83, 3, 20, 250] }
  ],
  features: [
    { name: "Точность", moreIsBetter: true, weight: 0.4 },
    { name: "Пропускная способность (Гбит/сек)", moreIsBetter: true, weight: 0.3 },
    { name: "Задержка (мс)", moreIsBetter: false, weight: 0.2 },
    { name: "Потребление ОЗУ (МБ)", moreIsBetter: false, weight: 0.1 }
  ]
};

function App() {
  const [results, setResults] = useState(null);

  const calculateResults = () => {
    // Нормализация значений с учётом направления оптимизации
    const normalized = PRESET.alternatives.map(alt => ({
      name: alt.name,
      values: PRESET.features.map((feature, i) => {
        const allValues = PRESET.alternatives.map(a => a.values[i]);
        const max = Math.max(...allValues);
        const min = Math.min(...allValues);

        return feature.moreIsBetter
          ? (alt.values[i] - min) / (max - min) || 0
          : (max - alt.values[i]) / (max - min) || 0;
      })
    }));

    // Аддитивная свёртка (простая сумма нормализованных значений)
    const additiveResults = normalized.map((alt, ind) => ({
      name: alt.name,
      score: alt.values.reduce((sum, val) => sum + val*PRESET.features[ind].weight, 0)
    }));

    // Максимакс (максимальное значение среди признаков)
    const maximaxResults = normalized.map(alt => ({
      name: alt.name,
      score: Math.max(...alt.values)
    }));

    setResults({
      additive: additiveResults,
      maximax: maximaxResults,
      additiveBest: findBest(additiveResults),
      maximaxBest: findBest(maximaxResults)
    });
  };

  const findBest = (scores) => {
    const maxScore = Math.max(...scores.map(s => s.score));
    return scores.filter(s => s.score === maxScore).map(s => s.name);
  };

  return (
    <div className="container">
      <h1>Выбор лучшей альтернативы</h1>

      <div className="input-section">
        <h2>Исходные данные:</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Альтернатива</th>
              {PRESET.features.map((feature, i) => (
                <th key={i}>
                  {feature.name}
                  <div className="feature-direction">
                    ({feature.moreIsBetter ? "↑ больше лучше" : "↓ меньше лучше"})
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRESET.alternatives.map((alt, altIndex) => (
              <tr key={altIndex}>
                <td>{alt.name}</td>
                {alt.values.map((value, valIndex) => (
                  <td key={valIndex}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <button className="calculate-btn" onClick={calculateResults}>
          Рассчитать
        </button>
      </div>

      {results && (
        <div className="results-section">
          <h2>Результаты:</h2>

          <div className="result-block">
            <h3>Аддитивная свёртка:</h3>
            <table className="result-table">
              <thead>
                <tr>
                  <th>Альтернатива</th>
                  <th>Оценка</th>
                </tr>
              </thead>
              <tbody>
                {results.additive.map((res, i) => (
                  <tr key={i}>
                    <td>{res.name}</td>
                    <td>{res.score.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="best-result">
              Лучшая альтернатива по аддитивной свёртке: <strong>{results.additiveBest.join(', ')}</strong>
            </p>
          </div>

          <div className="result-block">
            <h3>Максимакс:</h3>
            <table className="result-table">
              <thead>
                <tr>
                  <th>Альтернатива</th>
                  <th>Оценка</th>
                </tr>
              </thead>
              <tbody>
                {results.maximax.map((res, i) => (
                  <tr key={i}>
                    <td>{res.name}</td>
                    <td>{res.score.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="best-result">
              Лучшая альтернатива по критерию максимакса: <strong>{results.maximaxBest.join(', ')}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
