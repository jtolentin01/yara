import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { CommonModule } from '@angular/common';
import { UserDataService } from '../../services/user-data/user-data.service';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  summary: any = {
    totalBatches: 0,
    lastDayBatches: 0,
    mostUsedTool: "",
    topUser: "",
    topUserBatches: "",
    topUserImg: "",
    mostUsedToolCount: "",
    recentlyAddedUser: [],
    totalItems: 0,
    toolmetrics: [],
  };

  readonly profileBaseUrl = "https://yara-web.s3.ap-southeast-2.amazonaws.com/img/";

  public chartOptions: any;
  public chartOptions2: any;

  constructor(private analytics: AnalyticsService, private userDataService: UserDataService) { }

  public user = this.userDataService.getUserDataFromCookies() ? this.userDataService.getUserDataFromCookies() : "";

  ngOnInit(): void {
    this.analytics.getSummary().subscribe(response => {
      this.summary = response;
      this.updateChartOptions();
    });
  }

  private updateChartOptions(): void {
    const tools = this.summary.toolmetrics.map((item: any) => item.tool);
    const batches = this.summary.toolmetrics.map((item: any) => item.totalBatches);
    const ave = this.summary.toolmetrics.map((item: any) => item.totalBatches/2);
    const lowest = this.summary.toolmetrics.map((item: any) => item.totalBatches/4);
    this.chartOptions = {
      series: [
        {
          name: "Tool Usage",
          type: "bar",
          data: batches
        },
        {
          name: "Average Usage",
          type: "line",
          data: ave
        }
      ],
      fill: {
        type: 'gradient',
        gradient: {
          gradientToColors: ['#36BDCB'],
          inverseColors: false,
          stops: [0, 100]
        }
      },
      chart: {
        height: 350,
        type: "line",
        stacked: false,
        toolbar: {
          show: false
        }
      },
      grid: {
        show: true,
        borderColor: '#333' 
      },

      title: {
        text: ""
      },
      xaxis: {
        categories: tools,
        labels: {
          style: {
            colors: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 'bold'
          },
          
        }
      },
      
      yaxis: [
        {
          title: {
            text: 'Tool Usage',
          },
          labels: {
            style: {
              colors: '#FFFFFF'
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Average Usage',
          },
          labels: {
            style: {
              colors: '#52B12C'
            }
          }
        }
      ],
      plotOptions: {
        bar: {
          borderRadius: 4,
          dataLabels: {
            position: 'top',
          }
        }
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [0],
        style: {
          colors: ['#52B12C']
        }
      },
      stroke: {
        width: [0, 3],
      },
      colors: ['#008FFB', '#52B12C']
    };

    this.chartOptions2 = {
      series: [
        {
          name: "Tool Usage",
          data: ave
        },
        {
          name: "Average Usage",
          type: "bar",
          data: lowest
        }
      ],
      chart: {
        height: 350,
        type: "bar",
        stacked: false,
        toolbar: {
          show: false
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 200, 200]
        }
      },
      grid: {
        show: true,
        borderColor: '#333' 
      },

      title: {
        text: ""
      },
      xaxis: {
        categories: tools,
        labels: {
          style: {
            colors: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 'bold'
          },
          
        }
      },
      
      yaxis: [
        {
          title: {
            text: 'Tool Usage',
          },
          labels: {
            style: {
              colors: '#FFFFFF'
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Average Usage',
          },
          labels: {
            style: {
              colors: '#52B12C'
            }
          }
        }
      ],
      plotOptions: {
        bar: {
          borderRadius: 4,
          dataLabels: {
            position: 'top',
          }
        }
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [0],
        style: {
          colors: ['#52B12C']
        }
      },
      stroke: {
        width: [0, 3],
      },
      colors: ['#008FFB', '#52B12C']
    };
  }


}
