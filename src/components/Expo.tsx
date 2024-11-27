import { Typography, Box } from "@mui/material";
import { BarChart } from '@mui/x-charts/BarChart';
import { ChartsReferenceLine } from '@mui/x-charts';
import { OptionsHedgingData } from "@/lib/hooks";
import { getColorPallete } from "@/lib/color";
import { humanAbsCurrencyFormatter } from "@/lib/formatters";

type OptionsDatasetType = "dex" | "gex" | "oi" | "volume"
interface IExpo {
    data: OptionsHedgingData,
    exposure: OptionsDatasetType,
    symbol: string,
    dte: number,
    skipAnimation?: boolean
}

const colorCodes = getColorPallete();

export const typeMap = {
    'DEX': 'dex' as OptionsDatasetType,
    'GEX': 'gex' as OptionsDatasetType,
    'OI': 'oi' as OptionsDatasetType,
    'VOLUME': 'volume' as OptionsDatasetType
}




export const Expo = (props: IExpo) => {
    const { data, dte, symbol, skipAnimation } = props;
    // const height = (data.strikes.length < 10 ? 100 : 0) + data.strikes.length * 15;
    /*
    some wierd calculation since there's no straight forward way to set the height of the bars. 
    So 5px for both of the top and bottom margins, and 15px for each bar. Along with 20px for each expirations legends with max of 3 expirations.
    */ 
    const bufferHeight = 10 + 40 + ((data.expirations.length > 3 ? 3: data.expirations.length) * 20);   
    const height = bufferHeight + (data.strikes.length * 15);
    const yaxisline = Math.max(...data.strikes.filter(j => j <= data.currentPrice));
    const series = data.expirations.flatMap(j => {
        return [{
            dataKey: `${j}-call`, label: `${j}`, barSize: 20, stack: `stack`, color: colorCodes[data.expirations.indexOf(j)]
        },
        {
            dataKey: `${j}-put`, label: `${j}`, barSize: 20, stack: `stack`, color: colorCodes[data.expirations.indexOf(j)]
        }]
    });

    const fn = () => {
        switch (props.exposure) {
            case 'dex':
                return {
                    gammaOrDelta: 'ABS Delta Exposure',
                    ds: data.deltaDataset
                }
            case 'gex':
                return {
                    gammaOrDelta: 'NET Gamma Exposure',
                    ds: data.gammaDataset
                }

            case 'oi':
                return {
                    gammaOrDelta: 'Open interest',
                    ds: data.oiDataset
                }
            case 'volume':
                return {
                    gammaOrDelta: 'Volume',
                    ds: data.volumeDataset
                }
        }
    }

    // const gammaOrDelta = (props.exposure == 'dex' ? 'ABS Delta' : 'NET Gamma');
    // const { dataset, maxPosition } = props.exposure == 'dex' ? data.deltaDataset : data.gammaDataset;
    const { gammaOrDelta, ds } = fn();
    const { dataset, maxPosition } = ds;

    const title = `$${symbol.toUpperCase()} ${gammaOrDelta} (${dte} DTE)`;
    return <Box><Typography variant="h6" align="center" gutterBottom>
        {title}
    </Typography><BarChart
        height={height}
        dataset={dataset}
        series={series}
        skipAnimation={skipAnimation}
        
        tooltip={{
            trigger: 'none'
        }}
        margin={ { left: 64, right: 20} }
        yAxis={[
            {
                dataKey: 'strike',
                scaleType: 'band',
                reverse: true,
                valueFormatter: (tick) => `$${Number(tick).toFixed(2)}`
            },
        ]}
        layout="horizontal"
        xAxis={
            [
                {
                    label: `${gammaOrDelta}`,
                    scaleType: 'linear',
                    min: -maxPosition * 1.05,  //5% extra to allow some spacing
                    max: maxPosition * 1.05,
                    valueFormatter: humanAbsCurrencyFormatter
                }
            ]
        }

        slotProps={{
            legend: {
                seriesToDisplay: data.expirations.map(j => {
                    return {
                        id: j,
                        color: colorCodes[data.expirations.indexOf(j)],
                        label: j
                    }
                }),
                direction: 'column',
                position: {
                    vertical: 'top',
                    horizontal: 'right',
                },
                labelStyle: {
                    fontSize: '0.75rem'
                },
                itemMarkWidth: 24,
                itemMarkHeight: 8,
                markGap: 2,
                itemGap: 2,
            }
        }}>

            <ChartsReferenceLine x={0} />
            <ChartsReferenceLine y={yaxisline} label={"SPOT PRICE: $" + data.currentPrice}
                labelAlign="start"
                lineStyle={{
                    color: 'red',
                    stroke: 'red'
                }}
                labelStyle={
                    {
                        stroke: 'red',
                        strokeWidth: 0.25,
                        fontSize: '8px'
                    }
                } />
        </BarChart></Box>
}